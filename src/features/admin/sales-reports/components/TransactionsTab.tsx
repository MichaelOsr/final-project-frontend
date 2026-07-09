import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps, ComponentType, Ref } from "react";
import { useSearchParams } from "react-router-dom";
import { DownloadIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { CSVLink } from "react-csv";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import {
  getPageParam,
  updateSearchParams,
} from "@/features/admin/shared/utils/searchParams";
import { useDebouncedSearchParam } from "@/features/admin/shared/hooks/useDebouncedSearchParam";
import { useReportError } from "@/features/admin/shared/hooks/useReportError";
import { useLatestRequest } from "@/features/admin/shared/hooks/useLatestRequest";
import { AccessDenied } from "@/features/admin/shared/components/ChartFeedback";
import { RangeCaption } from "@/features/admin/shared/components/RangeCaption";
import { salesReportService } from "../services/salesReport.service";
import type { SalesReportCommonQuery } from "../types/salesReport.types";
import type { ResolvedRange } from "@/features/admin/shared/types/admin.types";
import type { TransactionItem } from "../types/transactionReport.types";
import {
  getTransactionCsvFilename,
  getTransactionCsvHeaders,
  toTransactionCsvRows,
} from "../utils/transactionCsv";
import { TransactionsTable } from "./TransactionsTable";
import { TransactionDetailDialog } from "./TransactionDetailDialog";
import { ExportTransactionsDialog } from "./ExportTransactionsDialog";

// react-csv's CSVLink builds its download href from the `data`/`headers` props
// at render time. Feeding it fresh data requires: fetch -> setState -> wait
// for the re-render to land -> then synthetically click the (hidden) link.
// Clicking before the re-render would download the *previous* href.
//
// @types/react-csv's LinkProps extends the anchor element's HTML attributes
// without omitting `ref`, so the JSX-inferred ref type is an unsatisfiable
// intersection of the component-instance ref and the DOM-node ref. Re-typing
// the component with the single ref shape we actually get at runtime (the
// instance exposes `.link`, the underlying anchor) sidesteps that quirk.
type CSVLinkHandle = { link: HTMLAnchorElement };
const CSVLinkExport = CSVLink as unknown as ComponentType<
  Omit<ComponentProps<typeof CSVLink>, "ref"> & { ref?: Ref<CSVLinkHandle> }
>;

const DEFAULT_META: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

interface TransactionsTabProps {
  query: SalesReportCommonQuery;
  isActive: boolean;
  // When set, the report is locked to a single store (store-context mode);
  // showing a Store column there would just repeat the same value every row.
  forcedStoreId?: string;
}

export function TransactionsTab({ query, isActive, forcedStoreId }: TransactionsTabProps) {
  const handleError = useReportError();
  const { start, isCurrent } = useLatestRequest();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useDebouncedSearchParam("q");
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [range, setRange] = useState<ResolvedRange | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const csvLinkRef = useRef<CSVLinkHandle>(null);
  const pendingDownloadRef = useRef(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportRows, setExportRows] = useState<TransactionItem[]>([]);
  const [exportFilename, setExportFilename] = useState(
    getTransactionCsvFilename(null),
  );

  // Flatten + quote-escape only when the fetched rows change, so the hidden
  // CSVLink's href is rebuilt with RFC-compliant data right before we click it.
  const csvData = useMemo(() => toTransactionCsvRows(exportRows), [exportRows]);

  const page = getPageParam(searchParams);
  const q = searchParams.get("q") ?? "";

  // Backend already scopes the report to confirmed transactions only, so there
  // is no status filter to send here.
  const transactionQuery = useMemo(
    () => ({
      ...query,
      ...(q.trim() ? { q: q.trim() } : {}),
      page,
      limit: 10,
    }),
    [query, q, page],
  );

  useEffect(() => {
    if (!isActive) return;
    const requestId = start();
    async function load() {
      setIsLoading(true);
      setForbidden(false);
      try {
        const res = await salesReportService.transactions(transactionQuery);
        if (!isCurrent(requestId)) return;
        setItems(res.data.data.items);
        setMeta(res.data.meta ?? DEFAULT_META);
        setRange(res.data.data.filters.resolvedRange);
      } catch (error) {
        if (!isCurrent(requestId)) return;
        if (handleError(error) === "forbidden") setForbidden(true);
      } finally {
        if (isCurrent(requestId)) setIsLoading(false);
      }
    }
    load();
  }, [isActive, transactionQuery, handleError, start, isCurrent]);

  // Fires only after `exportRows` has actually re-rendered into the hidden
  // CSVLink below, so the link's href reflects the export we just fetched
  // (not whatever was there before, and not before the fetch even started).
  useEffect(() => {
    if (pendingDownloadRef.current && exportRows.length > 0) {
      pendingDownloadRef.current = false;
      csvLinkRef.current?.link.click();
      setIsExporting(false);
      setIsExportDialogOpen(false);
    }
  }, [exportRows]);

  function update(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await salesReportService.transactionsExport({
        ...query,
        ...(q.trim() ? { q: q.trim() } : {}),
      });
      const { items: rows, filters } = res.data.data;
      if (rows.length === 0) {
        toast.info("No transactions to export for the selected filters.");
        setIsExporting(false);
        setIsExportDialogOpen(false);
        return;
      }
      setExportFilename(getTransactionCsvFilename(filters.resolvedRange));
      pendingDownloadRef.current = true;
      setExportRows(rows);
      // isExporting/isExportDialogOpen are cleared by the download effect
      // above once the synthetic click actually fires, not here — otherwise
      // the dialog would close before the file download kicks off.
    } catch (error) {
      if (handleError(error) === "forbidden") setForbidden(true);
      setIsExporting(false);
      setIsExportDialogOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-background p-4">
        <div className="min-w-56 flex-1">
          <Label htmlFor="transaction-search" className="mb-1.5 block text-xs text-muted-foreground">
            Search Transaction
          </Label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="transaction-search"
              className="h-9 pl-9"
              placeholder="Search by ID, customer name, or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setIsExportDialogOpen(true)}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <DownloadIcon />
          )}
          Export CSV
        </Button>
        <CSVLinkExport
          ref={csvLinkRef}
          className="hidden"
          data={csvData}
          headers={getTransactionCsvHeaders(!forcedStoreId)}
          filename={exportFilename}
        />
      </div>

      {forbidden ? (
        <AccessDenied />
      ) : (
        <>
          <RangeCaption range={range} />
          <Card className="overflow-hidden rounded-lg p-0">
            <CardContent className="p-0">
              <TransactionsTable
                items={items}
                isLoading={isLoading}
                meta={meta}
                showStoreColumn={!forcedStoreId}
                onPageChange={(nextPage) => update({ page: nextPage })}
                onView={(item) => setSelectedId(item.transactionId)}
              />
            </CardContent>
          </Card>
        </>
      )}

      <TransactionDetailDialog
        transactionId={selectedId}
        onClose={() => setSelectedId(null)}
      />

      <ExportTransactionsDialog
        open={isExportDialogOpen}
        isExporting={isExporting}
        onOpenChange={setIsExportDialogOpen}
        onConfirm={handleExport}
      />
    </div>
  );
}
