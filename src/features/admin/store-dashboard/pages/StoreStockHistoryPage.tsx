import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import { storeDashboardService } from "../services/storeDashboard.service";
import { useStoreContext } from "../hooks/useStoreContext";
import { StockHistoryTable } from "../components/StockHistoryTable";
import { StockHistoryDetailDialog } from "../components/StockHistoryDetailDialog";
import { StockMovementFilters } from "../components/StockMovementFilters";
import type { SortOrder, StockMovement, StockMovementSortField, StockMovementType } from "../types/stockMovement.types";

const defaultMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

export function StoreStockHistoryPage() {
  usePageTitle("Stock History");
  const { storeId, isReady } = useStoreContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [meta, setMeta] = useState(defaultMeta);
  const [detailTarget, setDetailTarget] = useState<StockMovement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const page = getPageParam(searchParams);
  const type = (searchParams.get("type") ?? "") as StockMovementType | "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const sortBy = (searchParams.get("sortBy") ?? "createdAt") as StockMovementSortField;
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as SortOrder;

  useEffect(() => {
    if (!isReady) return;
    let isMounted = true;
    async function loadMovements() {
      try {
        const response = await storeDashboardService.getStoreMovements(storeId, {
          page,
          limit: 10,
          sortBy,
          sortOrder,
          ...(type ? { type } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        });
        if (!isMounted) return;
        setMovements(response.data.data ?? []);
        setMeta(response.data.meta ?? defaultMeta);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadMovements();
    return () => {
      isMounted = false;
    };
  }, [isReady, storeId, page, type, startDate, endDate, sortBy, sortOrder]);

  function updateFilters(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  function handleSort(field: StockMovementSortField) {
    const nextOrder: SortOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    updateFilters({ sortBy: field, sortOrder: nextOrder, page: 1 });
  }

  async function openDetail(movement: StockMovement) {
    setDetailTarget(movement);
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const response = await storeDashboardService.getMovementDetail(storeId, movement.id);
      setDetailTarget(response.data.data ?? movement);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsDetailLoading(false);
    }
  }

  return (
    <AdminDashboardShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Stock History</h1>
          <p className="text-sm text-muted-foreground">All stock movements recorded for your store.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/admin/store/stock"><ArrowLeftIcon className="size-4" />Back to Stock</Link>
        </Button>
      </div>

      <Card className="rounded-lg p-0">
        <CardContent className="overflow-hidden p-0">
          <StockMovementFilters type={type} startDate={startDate} endDate={endDate} onChange={updateFilters} />
          <StockHistoryTable
            movements={movements}
            isLoading={isLoading}
            meta={meta}
            page={page}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onPageChange={(nextPage) => updateFilters({ page: nextPage })}
            onView={openDetail}
            showProduct
          />
        </CardContent>
      </Card>

      <StockHistoryDetailDialog
        open={isDetailOpen}
        movement={detailTarget}
        isLoading={isDetailLoading}
        onOpenChange={setIsDetailOpen}
      />
    </AdminDashboardShell>
  );
}
