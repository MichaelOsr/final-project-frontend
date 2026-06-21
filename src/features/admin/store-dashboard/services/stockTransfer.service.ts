import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type {
  CreateTransferPayload,
  StockTransferRequest,
  TransferActionPayload,
  TransferRequestsParams,
  TransferSource,
} from "../types/stockTransfer.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

export const stockTransferService = {
  getSources: (productId: string, excludeStoreId?: string) =>
    adminAxios.get<ApiResponse<TransferSource[]>>("/admin/stock/transfers/sources", {
      params: { productId, ...(excludeStoreId ? { excludeStoreId } : {}) },
    }),

  createRequest: (payload: CreateTransferPayload) =>
    adminAxios.post<ApiResponse<StockTransferRequest>>("/admin/stock/transfers/requests", payload),

  listRequests: (storeId: string, params: TransferRequestsParams) =>
    adminAxios.get<PaginatedApiResponse<StockTransferRequest>>(
      `/admin/stock/transfers/store/${storeId}/requests`,
      { params },
    ),

  getRequest: (storeId: string, id: string) =>
    adminAxios.get<ApiResponse<StockTransferRequest>>(
      `/admin/stock/transfers/store/${storeId}/requests/${id}`,
    ),

  approve: (id: string, payload: Pick<TransferActionPayload, "responseNotes">) =>
    adminAxios.post<ApiResponse<{ request: StockTransferRequest }>>(`/admin/stock/transfers/requests/${id}/approve`, payload),

  reject: (id: string, payload: Pick<TransferActionPayload, "responseNotes">) =>
    adminAxios.post<ApiResponse<StockTransferRequest>>(`/admin/stock/transfers/requests/${id}/reject`, payload),

  receive: (id: string, payload: Pick<TransferActionPayload, "receivedNotes">) =>
    adminAxios.post<ApiResponse<{ request: StockTransferRequest }>>(`/admin/stock/transfers/requests/${id}/receive`, payload),

  cancel: (id: string, payload: Pick<TransferActionPayload, "cancelledNotes">) =>
    adminAxios.post<ApiResponse<StockTransferRequest>>(`/admin/stock/transfers/requests/${id}/cancel`, payload),
};
