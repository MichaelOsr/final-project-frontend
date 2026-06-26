import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AxiosError } from "axios";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import { stockTransferService } from "../services/stockTransfer.service";
import type {
  StockTransferRequest,
  TransferAction,
  TransferDirection,
  TransferSortField,
  TransferStatus,
} from "../types/stockTransfer.types";
import { CreateTransferDialog } from "./CreateTransferDialog";
import { TransferActionDialog } from "./TransferActionDialog";
import { TransferDetailDialog } from "./TransferDetailDialog";
import { TransferFilters } from "./TransferFilters";
import { TransferRequestsTable } from "./TransferRequestsTable";

const defaultMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

// Inventory > Transfers tab: stock transfer requests for the store.
export function StockTransfersTab({ storeId }: { storeId: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<StockTransferRequest[]>([]);
  const [meta, setMeta] = useState(defaultMeta);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<StockTransferRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [actionTarget, setActionTarget] = useState<StockTransferRequest | null>(null);
  const [pendingAction, setPendingAction] = useState<TransferAction | null>(null);
  const [isActionOpen, setIsActionOpen] = useState(false);

  const page = getPageParam(searchParams);
  const status = (searchParams.get("status") ?? "") as TransferStatus | "";
  const direction = (searchParams.get("direction") ?? "") as TransferDirection | "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const sortBy = (searchParams.get("sortBy") ?? "createdAt") as TransferSortField;
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const res = await stockTransferService.listRequests(storeId, {
          page,
          limit: 10,
          sortBy,
          sortOrder,
          ...(status ? { status } : {}),
          ...(direction ? { direction } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        });
        if (!isMounted) return;
        setRequests(res.data.data ?? []);
        setMeta(res.data.meta ?? defaultMeta);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [storeId, page, status, direction, startDate, endDate, sortBy, sortOrder]);

  function updateFilters(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  function handleSort(field: TransferSortField) {
    const nextOrder: "asc" | "desc" = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    updateFilters({ sortBy: field, sortOrder: nextOrder, page: 1 });
  }

  async function openDetail(request: StockTransferRequest) {
    setDetailTarget(request);
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const res = await stockTransferService.getRequest(storeId, request.id);
      setDetailTarget(res.data.data ?? request);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        setDetailTarget(null);
      } else {
        toast.error(getAdminErrorMessage(error));
      }
    } finally {
      setIsDetailLoading(false);
    }
  }

  function openAction(request: StockTransferRequest, action: TransferAction) {
    setActionTarget(request);
    setPendingAction(action);
    setIsActionOpen(true);
  }

  function handleActionDone(updated: StockTransferRequest) {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (detailTarget?.id === updated.id) setDetailTarget(updated);
  }

  function handleCreated(request: StockTransferRequest) {
    setRequests((prev) => [request, ...prev]);
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusIcon className="size-4" />
          New Request
        </Button>
      </div>

      <Card className="rounded-lg p-0">
        <CardContent className="overflow-hidden p-0">
          <TransferFilters
            status={status}
            direction={direction}
            startDate={startDate}
            endDate={endDate}
            onChange={updateFilters}
          />
          <TransferRequestsTable
            requests={requests}
            isLoading={isLoading}
            meta={meta}
            page={page}
            sortBy={sortBy}
            sortOrder={sortOrder}
            myStoreId={storeId}
            onSort={handleSort}
            onPageChange={(nextPage) => updateFilters({ page: nextPage })}
            onView={openDetail}
            onAction={openAction}
          />
        </CardContent>
      </Card>

      <CreateTransferDialog
        open={isCreateOpen}
        toStoreId={storeId}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
      />

      <TransferDetailDialog
        open={isDetailOpen}
        request={detailTarget}
        isLoading={isDetailLoading}
        myStoreId={storeId}
        onOpenChange={setIsDetailOpen}
        onAction={openAction}
      />

      <TransferActionDialog
        open={isActionOpen}
        request={actionTarget}
        action={pendingAction}
        onOpenChange={setIsActionOpen}
        onDone={handleActionDone}
      />
    </>
  );
}
