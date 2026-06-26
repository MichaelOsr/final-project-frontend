import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchIcon } from "lucide-react";
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
import type { SalesReportCommonQuery, SalesReportStatus } from "../types/salesReport.types";
import type { ResolvedRange } from "@/features/admin/shared/types/admin.types";
import type { TransactionItem } from "../types/transactionReport.types";
import { TransactionsTable } from "./TransactionsTable";
import { TransactionDetailDialog } from "./TransactionDetailDialog";

const DEFAULT_META: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

const STATUS_OPTIONS: { value: SalesReportStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "process", label: "Process" },
  { value: "onDelivery", label: "On Delivery" },
  { value: "confirmed", label: "Confirmed" },
];

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

  const page = getPageParam(searchParams);
  const status = (searchParams.get("status") ?? "") as SalesReportStatus | "";
  const q = searchParams.get("q") ?? "";

  const transactionQuery = useMemo(
    () => ({
      ...query,
      ...(status ? { status } : {}),
      ...(q.trim() ? { q: q.trim() } : {}),
      page,
      limit: 10,
    }),
    [query, status, q, page],
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

  function update(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
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
        <div className="w-48 shrink-0">
          <Label htmlFor="transaction-status" className="mb-1.5 block text-xs text-muted-foreground">
            Status
          </Label>
          <select
            id="transaction-status"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => update({ status: e.target.value, page: 1 })}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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
    </div>
  );
}
