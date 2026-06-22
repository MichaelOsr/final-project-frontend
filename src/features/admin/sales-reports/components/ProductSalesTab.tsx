import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import { useDebouncedSearchParam } from "@/features/admin/shared/hooks/useDebouncedSearchParam";
import { adminCategoryService } from "@/features/admin/categories/services/adminCategory.service";
import type { AdminCategory } from "@/features/admin/categories/types/adminCategory.types";
import type {
  ProductSalesQuery,
  SalesReportCommonQuery,
} from "../types/salesReport.types";
import { ProductPeriodChart } from "./ProductPeriodChart";
import { ProductRankingPanel } from "./ProductRankingPanel";

export function ProductSalesTab({
  query,
  isActive,
}: {
  query: SalesReportCommonQuery;
  isActive: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useDebouncedSearchParam("q");
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  const categoryId = searchParams.get("categoryId") ?? "";
  const q = searchParams.get("q") ?? "";

  useEffect(() => {
    adminCategoryService
      .list({ page: 1, limit: 100 })
      .then((res) => setCategories(res.data.data ?? []))
      .catch(() => {});
  }, []);

  const productQuery = useMemo<ProductSalesQuery>(
    () => ({
      ...query,
      ...(categoryId ? { categoryId } : {}),
      ...(q.trim() ? { q: q.trim() } : {}),
    }),
    [query, categoryId, q],
  );

  function update(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-background p-4">
        <div className="min-w-[14rem] flex-1">
          <Label className="mb-1.5 block text-xs text-muted-foreground">
            Search Product
          </Label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-9"
              placeholder="Search by name or SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
        <div className="w-48 shrink-0">
          <Label className="mb-1.5 block text-xs text-muted-foreground">
            Category
          </Label>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={categoryId}
            onChange={(e) => update({ categoryId: e.target.value, page: 1 })}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ProductPeriodChart query={productQuery} isActive={isActive} />
      <ProductRankingPanel query={productQuery} isActive={isActive} />
    </div>
  );
}
