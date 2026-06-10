import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Edit2Icon, ShoppingCartIcon, TrendingDownIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebouncedSearchParam } from "@/features/admin/shared/hooks/useDebouncedSearchParam";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import { formatDate, formatNumber } from "@/features/admin/shared/utils/adminFormat";
import { storeDashboardService } from "../services/storeDashboard.service";
import type { StoreStock } from "../types/storeDashboard.types";

const defaultMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

export function StoreStockList({ storeId }: { storeId: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [stocks, setStocks] = useState<StoreStock[]>([]);
  const [meta, setMeta] = useState(defaultMeta);
  const [searchInput, setSearchInput] = useDebouncedSearchParam("q");
  const page = getPageParam(searchParams);
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    let isMounted = true;
    async function loadStocks() {
      try {
        const response = await storeDashboardService.getStocks(storeId, {
          page,
          limit: 10,
          ...(query.trim() ? { q: query.trim() } : {}),
        });
        if (!isMounted) return;
        setStocks(response.data.data ?? []);
        setMeta(response.data.meta ?? defaultMeta);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadStocks();
    return () => {
      isMounted = false;
    };
  }, [page, query, storeId]);

  function updateFilters(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={<ShoppingCartIcon className="size-5" />}
          label="Total Products"
          value={formatNumber(meta.total)}
        />
        <MetricCard
          icon={<TrendingDownIcon className="size-5" />}
          label="Low Stock"
          value={formatNumber(stocks.filter((s) => s.stock < 10).length)}
        />
        <MetricCard
          icon={<ShoppingCartIcon className="size-5" />}
          label="Out of Stock"
          value={formatNumber(stocks.filter((s) => s.stock === 0).length)}
        />
      </div>

      <Card className="rounded-lg p-0">
        <CardContent className="overflow-hidden p-0">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Store Products & Stock</h2>
                <p className="text-xs text-muted-foreground">View and manage your store inventory</p>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-left font-semibold">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-center font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">Updated</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                )}
                {!isLoading && stocks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  stocks.map((stock) => (
                    <tr key={stock.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {stock.product.images[0] && (
                            <img
                              src={stock.product.images[0].image}
                              alt={stock.product.name}
                              className="size-10 rounded-lg object-cover"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium">{stock.product.name}</p>
                            <p className="text-xs text-muted-foreground">{stock.product.category.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{stock.product.sku}</td>
                      <td className="px-4 py-3">Rp {formatNumber(stock.product.price)}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            stock.stock === 0
                              ? "bg-red-100 text-red-700"
                              : stock.stock < 10
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {stock.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(stock.updatedAt)}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info("To be implemented")}
                          title="Edit stock"
                        >
                          <Edit2Icon className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!isLoading && stocks.length > 0 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
              <p className="text-muted-foreground">
                Showing {stocks.length} of {meta.total} products
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => updateFilters({ page: page - 1 })}
                >
                  Previous
                </Button>
                <span className="flex items-center px-2 text-xs text-muted-foreground">
                  Page {page} of {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => updateFilters({ page: page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-2 text-primary">{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
