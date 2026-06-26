import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { SortOrder } from "@/features/admin/shared/components/AdminDataTable";
import { RangeCaption } from "@/features/admin/shared/components/RangeCaption";
import { AccessDenied } from "@/features/admin/shared/components/ChartFeedback";
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import type { StoreOption } from "@/features/admin/shared/types/admin.types";
import type { StockMovementType } from "@/features/admin/store-dashboard/types/stockMovement.types";
import { useStockReportData } from "../hooks/useStockReportData";
import type { StockReportItem, StockReportQuery, StockReportSortBy } from "../types/stockReport.types";
import { StockReportFilters } from "./StockReportFilters";
import { StockReportResults } from "./StockReportResults";
import { StockReportDetailDialog } from "./StockReportDetailDialog";
import { ProductFilterChip } from "./ProductFilterChip";

const DEFAULT_SORT: StockReportSortBy = "createdAt";
const DEFAULT_LIMIT = 10;

interface StockReportViewProps {
  // Active store (operational pages) or selected/"" store (super admin
  // cross-store page, where "" means all stores).
  storeId: string;
  isActive: boolean;
  showStore?: boolean;
  // When provided, renders the store selector inside the filter card (used by
  // the super admin cross-store page instead of a separate top bar). Changing
  // it updates the shared `storeId` URL param, which the parent re-reads.
  stores?: StoreOption[];
}

// Unified stock report: one request to GET /admin/stock/reports returns the
// summary, the movement history, and pagination.
export function StockReportView({ storeId, isActive, showStore = false, stores }: StockReportViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [detailTarget, setDetailTarget] = useState<StockReportItem | null>(null);
  // Tracks the product name behind `productId` so the active-filter chip has
  // a label instead of a raw uuid (the drill-down sets this from a row we
  // already have in memory).
  const [productFilterLabel, setProductFilterLabel] = useState("");

  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const productId = searchParams.get("productId") ?? "";
  const sortBy = (searchParams.get("sortBy") ?? DEFAULT_SORT) as StockReportSortBy;
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as SortOrder;
  const page = getPageParam(searchParams);
  const limit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT) || DEFAULT_LIMIT;

  const query = useMemo<StockReportQuery>(
    () => ({
      ...(storeId ? { storeId } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(q.trim() ? { q: q.trim() } : {}),
      ...(type ? { type: type as StockMovementType } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(productId ? { productId } : {}),
      sortBy,
      sortOrder,
      page,
      limit,
    }),
    [storeId, startDate, endDate, q, type, categoryId, productId, sortBy, sortOrder, page, limit],
  );

  const { categories, items, summary, range, meta, isLoading, forbidden } = useStockReportData(
    query,
    isActive,
  );

  function update(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  function filterByProduct(item: StockReportItem) {
    setProductFilterLabel(item.productName);
    update({ productId: item.productId, q: "", page: 1 });
    setDetailTarget(null);
  }

  if (forbidden) return <AccessDenied />;

  return (
    <div className="space-y-4">
      <StockReportFilters
        startDate={startDate}
        endDate={endDate}
        type={type}
        categoryId={categoryId}
        hasExtraFilters={Boolean(productId)}
        categories={categories}
        onChange={update}
        stores={stores}
        storeId={storeId}
      />

      {productId && (
        <ProductFilterChip
          label={productFilterLabel}
          onClear={() => {
            setProductFilterLabel("");
            update({ productId: "", page: 1 });
          }}
        />
      )}

      <RangeCaption range={range} />

      <StockReportResults
        summary={summary}
        items={items}
        isLoading={isLoading}
        meta={meta}
        sortBy={sortBy}
        sortOrder={sortOrder}
        showStore={showStore}
        typeFilterActive={Boolean(type)}
        onSortChange={(nextSortBy, nextSortOrder) =>
          update({ sortBy: nextSortBy, sortOrder: nextSortOrder, page: 1 })
        }
        onPageChange={(nextPage) => update({ page: nextPage })}
        onPageSizeChange={(nextLimit) => update({ limit: nextLimit, page: 1 })}
        onSelect={setDetailTarget}
      />

      <StockReportDetailDialog
        open={Boolean(detailTarget)}
        item={detailTarget}
        onOpenChange={(open) => !open && setDetailTarget(null)}
        onFilterProduct={() => detailTarget && filterByProduct(detailTarget)}
      />
    </div>
  );
}
