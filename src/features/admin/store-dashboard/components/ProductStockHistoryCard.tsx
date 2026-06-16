import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { storeDashboardService } from "../services/storeDashboard.service";
import { StockHistoryTable } from "./StockHistoryTable";
import { StockHistoryDetailDialog } from "./StockHistoryDetailDialog";
import type { SortOrder, StockMovement, StockMovementSortField } from "../types/stockMovement.types";

const defaultMeta: PaginationMeta = { page: 1, limit: 5, total: 0, totalPages: 1 };

interface ProductStockHistoryCardProps {
  storeId: string;
  productId: string | null;
  refreshKey: number;
}

export function ProductStockHistoryCard({ storeId, productId, refreshKey }: ProductStockHistoryCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [meta, setMeta] = useState(defaultMeta);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<StockMovementSortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [detailTarget, setDetailTarget] = useState<StockMovement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    let isMounted = true;
    async function loadMovements() {
      try {
        const response = await storeDashboardService.getProductMovements(storeId, productId as string, { page, limit: 5, sortBy, sortOrder });
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
  }, [storeId, productId, page, sortBy, sortOrder, refreshKey]);

  function handleSort(field: StockMovementSortField) {
    setSortOrder((prev) => (sortBy === field && prev === "asc" ? "desc" : "asc"));
    setSortBy(field);
    setPage(1);
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

  if (!productId) {
    return (
      <Card className="rounded-lg">
        <CardHeader className="border-b border-border"><CardTitle>Stock History</CardTitle></CardHeader>
        <CardContent className="p-5 text-sm text-muted-foreground">No stock history available.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border"><CardTitle>Stock History</CardTitle></CardHeader>
      <CardContent className="p-0">
        <StockHistoryTable movements={movements} isLoading={isLoading} meta={meta} page={page} sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} onPageChange={setPage} onView={openDetail} />
      </CardContent>
      <StockHistoryDetailDialog open={isDetailOpen} movement={detailTarget} isLoading={isDetailLoading} onOpenChange={setIsDetailOpen} />
    </Card>
  );
}
