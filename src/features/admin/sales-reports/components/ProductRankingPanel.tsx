import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BoxesIcon, CoinsIcon, PackageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SortOrder } from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import {
  getPageParam,
  updateSearchParams,
} from "@/features/admin/shared/utils/searchParams";
import { formatPrice } from "@/lib/format";
import { formatNumber } from "@/features/admin/shared/utils/adminFormat";
import { salesReportService } from "../services/salesReport.service";
import { useReportError } from "@/features/admin/shared/hooks/useReportError";
import { useLatestRequest } from "@/features/admin/shared/hooks/useLatestRequest";
import type {
  ProductRankingItem,
  ProductSalesQuery,
  ProductSortBy,
  ResolvedRange,
} from "../types/salesReport.types";
import { ProductSalesTable } from "./ProductSalesTable";
import { ProductTrendDialog } from "./ProductTrendDialog";
import { AccessDenied } from "@/features/admin/shared/components/ChartFeedback";
import { SalesSummaryCards } from "./SalesSummaryCards";
import { RangeCaption } from "@/features/admin/shared/components/RangeCaption";

const DEFAULT_META: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };
const PLACEHOLDER = "—";

export function ProductRankingPanel({
  query,
  isActive,
}: {
  query: ProductSalesQuery;
  isActive: boolean;
}) {
  const handleError = useReportError();
  const { start, isCurrent } = useLatestRequest();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<ProductRankingItem[]>([]);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totals, setTotals] = useState({ items: 0, gross: 0 });
  const [range, setRange] = useState<ResolvedRange | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [selected, setSelected] = useState<ProductRankingItem | null>(null);

  const page = getPageParam(searchParams);
  const sortBy = (searchParams.get("sortBy") ?? "productSales") as ProductSortBy;
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as SortOrder;

  useEffect(() => {
    if (!isActive) return;
    const requestId = start();
    async function load() {
      setIsLoading(true);
      setForbidden(false);
      try {
        const res = await salesReportService.productRanking({
          ...query,
          page,
          limit: 10,
          sortBy,
          sortOrder,
        });
        if (!isCurrent(requestId)) return;
        setItems(res.data.data.items);
        setMeta(res.data.meta ?? DEFAULT_META);
        setTotalProducts(res.data.data.summary.totalProducts);
        setTotals({
          items: res.data.data.summary.totalItemsSold,
          gross: res.data.data.summary.productSales,
        });
        setRange(res.data.data.filters.resolvedRange);
      } catch (error) {
        if (!isCurrent(requestId)) return;
        if (handleError(error) === "forbidden") setForbidden(true);
      } finally {
        if (isCurrent(requestId)) setIsLoading(false);
      }
    }
    load();
  }, [isActive, query, page, sortBy, sortOrder, handleError, start, isCurrent]);

  function update(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  if (forbidden) return <AccessDenied />;

  return (
    <div className="space-y-4">
      <RangeCaption range={range} />
      <SalesSummaryCards
        metrics={[
          {
            label: "Products Sold",
            value: isLoading ? PLACEHOLDER : formatNumber(totalProducts),
            icon: PackageIcon,
          },
          {
            label: "Items Sold",
            value: isLoading ? PLACEHOLDER : formatNumber(totals.items),
            icon: BoxesIcon,
          },
          {
            label: "Product Sales",
            value: isLoading ? PLACEHOLDER : formatPrice(totals.gross),
            icon: CoinsIcon,
          },
        ]}
      />
      <Card className="overflow-hidden rounded-lg p-0">
        <CardContent className="p-0">
          <ProductSalesTable
            items={items}
            isLoading={isLoading}
            meta={meta}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(nextBy, nextOrder) =>
              update({ sortBy: nextBy, sortOrder: nextOrder, page: 1 })
            }
            onPageChange={(nextPage) => update({ page: nextPage })}
            onSelect={setSelected}
          />
        </CardContent>
      </Card>
      <ProductTrendDialog
        product={selected}
        query={query}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
