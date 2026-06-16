import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { HistoryIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useDebouncedSearchParam } from "@/features/admin/shared/hooks/useDebouncedSearchParam";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import { adminProductService } from "@/features/admin/products/services/adminProduct.service";
import type { ProductCategory } from "@/features/admin/products/types/adminProduct.types";
import { storeDashboardService } from "../services/storeDashboard.service";
import { StoreStockTable } from "../components/StoreStockTable";
import { StockMovementDialog } from "../components/StockMovementDialog";
import { ClearStockDialog } from "../components/ClearStockDialog";
import { useStoreContext } from "../hooks/useStoreContext";
import type { StoreStock } from "../types/storeDashboard.types";
import type { CreateMovementPayload } from "../types/stockMovement.types";

const defaultMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

export function StoreStockPage() {
  usePageTitle("Store Stock");
  const navigate = useNavigate();
  const { storeId, isReady } = useStoreContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [stocks, setStocks] = useState<StoreStock[]>([]);
  const [meta, setMeta] = useState(defaultMeta);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchInput, setSearchInput] = useDebouncedSearchParam("q");
  const [adjustTarget, setAdjustTarget] = useState<StoreStock | null>(null);
  const [clearTarget, setClearTarget] = useState<StoreStock | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const page = getPageParam(searchParams);
  const query = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const sortBy = searchParams.get("sort") ?? "productName";
  const sortOrder = (searchParams.get("order") ?? "asc") as "asc" | "desc";

  useEffect(() => {
    let isMounted = true;
    adminProductService
      .listCategories()
      .then((response) => isMounted && setCategories(response.data.data ?? []))
      .catch((error) => isMounted && toast.error(getAdminErrorMessage(error)));
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    async function loadStocks() {
      try {
        const response = await storeDashboardService.getStocks(storeId, {
          page,
          limit: 10,
          sortBy,
          sortOrder,
          ...(query.trim() ? { q: query.trim() } : {}),
          ...(categoryId ? { categoryId } : {}),
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
  }, [isReady, storeId, page, query, categoryId, sortBy, sortOrder, refreshKey]);

  function updateFilters(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  async function submitMovement(values: CreateMovementPayload, helpers: { setSubmitting: (value: boolean) => void }) {
    if (!adjustTarget) return;
    try {
      await storeDashboardService.createStockMovement(storeId, adjustTarget.productId, {
        ...values,
        quantity: Number(values.quantity),
      });
      toast.success("Stock updated");
      setAdjustTarget(null);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      helpers.setSubmitting(false);
    }
  }

  async function confirmClear(notes: string) {
    if (!clearTarget) return;
    setIsClearing(true);
    try {
      await storeDashboardService.clearStock(storeId, clearTarget.productId, notes ? { notes } : {});
      toast.success("Stock cleared");
      setClearTarget(null);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <AdminDashboardShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Store Stock</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor your store inventory.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/admin/store/stock/history">
            <HistoryIcon className="size-4" />
            Stock History
          </Link>
        </Button>
      </div>

      <Card className="rounded-lg p-0">
        <CardContent className="overflow-hidden p-0">
          <div className="space-y-3 border-b border-border px-4 py-3 md:grid md:grid-cols-[minmax(0,1fr)_16rem] md:gap-3 md:space-y-0">
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Search</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-9 pl-9"
                  placeholder="Search products"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <select
                className="border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={categoryId}
                onChange={(e) => updateFilters({ categoryId: e.target.value, page: 1 })}
              >
                <option value="">All categories</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          <StoreStockTable
            stocks={stocks}
            isLoading={isLoading}
            meta={meta}
            page={page}
            onView={(slug) => navigate(`/admin/store/products/${slug}`)}
            onAdjust={setAdjustTarget}
            onClear={setClearTarget}
            onPageChange={(nextPage) => updateFilters({ page: nextPage })}
          />
        </CardContent>
      </Card>

      <StockMovementDialog
        open={Boolean(adjustTarget)}
        productName={adjustTarget?.product.name ?? ""}
        currentStock={adjustTarget?.stock ?? 0}
        onOpenChange={(open) => !open && setAdjustTarget(null)}
        onSubmit={submitMovement}
      />
      <ClearStockDialog
        open={Boolean(clearTarget)}
        productName={clearTarget?.product.name ?? ""}
        currentStock={clearTarget?.stock ?? 0}
        isClearing={isClearing}
        onConfirm={confirmClear}
        onOpenChange={(open) => !open && setClearTarget(null)}
      />
    </AdminDashboardShell>
  );
}
