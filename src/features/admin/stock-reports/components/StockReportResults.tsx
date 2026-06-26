import {
  ActivityIcon,
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  BoxesIcon,
  PackageIcon,
  ScaleIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SortOrder } from "@/features/admin/shared/components/AdminDataTable";
import {
  SummaryCards,
  type SummaryMetric,
} from "@/features/admin/shared/components/SummaryCards";
import { formatNumber } from "@/features/admin/shared/utils/adminFormat";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type {
  StockReportItem,
  StockReportSortBy,
  StockReportSummary,
} from "../types/stockReport.types";
import { StockReportTable } from "./StockReportTable";

interface StockReportResultsProps {
  summary: StockReportSummary | null;
  items: StockReportItem[];
  isLoading: boolean;
  meta: PaginationMeta;
  sortBy: StockReportSortBy;
  sortOrder: SortOrder;
  showStore: boolean;
  // Movement type filter — when active, the type-independent metrics need an
  // explanatory note (see buildMetrics callers).
  typeFilterActive: boolean;
  onSortChange: (sortBy: string, sortOrder: SortOrder) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelect: (item: StockReportItem) => void;
}

// Summary cards + movement table, or an empty state when nothing matches the
// current filters. `summary.totalMovements === 0` is a reliable "no data"
// signal because it already accounts for every active filter.
export function StockReportResults({
  summary,
  items,
  isLoading,
  meta,
  sortBy,
  sortOrder,
  showStore,
  typeFilterActive,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onSelect,
}: StockReportResultsProps) {
  if (!isLoading && summary && summary.totalMovements === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className={isLoading ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <SummaryCards metrics={buildMetrics(summary)} columns="sm:grid-cols-2 lg:grid-cols-3" />
      </div>
      {typeFilterActive && (
        <p className="text-xs text-muted-foreground">
          Ending Stock and Total Products reflect end-of-period state and ignore the movement
          type filter.
        </p>
      )}
      <Card className="overflow-hidden rounded-lg p-0">
        <CardContent className="p-0">
          <StockReportTable
            items={items}
            isLoading={isLoading}
            meta={meta}
            sortBy={sortBy}
            sortOrder={sortOrder}
            showStore={showStore}
            onSortChange={onSortChange}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            onSelect={onSelect}
          />
        </CardContent>
      </Card>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border p-10 text-center">
      <p className="text-sm font-medium">No stock movements found</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Try widening the date range or clearing the search, type, and category filters.
      </p>
    </div>
  );
}

function buildMetrics(summary: StockReportSummary | null): SummaryMetric[] {
  return [
    { label: "Total Movements", value: formatNumber(summary?.totalMovements), icon: ActivityIcon },
    { label: "Stock In", value: formatNumber(summary?.stockIn), icon: ArrowDownToLineIcon },
    { label: "Stock Out", value: formatNumber(summary?.stockOut), icon: ArrowUpFromLineIcon },
    { label: "Net Change", value: formatNumber(summary?.netChange), icon: ScaleIcon },
    { label: "Ending Stock", value: formatNumber(summary?.endingStock), icon: BoxesIcon },
    { label: "Total Products", value: formatNumber(summary?.totalProducts), icon: PackageIcon },
  ];
}
