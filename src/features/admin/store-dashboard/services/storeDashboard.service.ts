import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type { StoreDashboardSummary, StoreStock } from "../types/storeDashboard.types";
import type {
  ClearStockPayload,
  CreateMovementPayload,
  StockMovement,
  StockMovementsParams,
  StockMutationResult,
} from "../types/stockMovement.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

export const storeDashboardService = {
  getSummary: (storeId: string) =>
    adminAxios.get<ApiResponse<StoreDashboardSummary>>(`/admin/dashboard/stores/${storeId}/summary`),
  getStocks: (storeId: string, params: Record<string, string | number>) =>
    adminAxios.get<PaginatedApiResponse<StoreStock>>(`/admin/stock/store/${storeId}`, { params }),
  getProductStock: (storeId: string, slug: string) =>
    adminAxios.get<ApiResponse<StoreStock>>(`/admin/stock/store/${storeId}/product/${slug}`),
  createStockMovement: (storeId: string, productId: string, payload: CreateMovementPayload) =>
    adminAxios.post<ApiResponse<StockMutationResult>>(`/admin/stock/store/${storeId}/product/${productId}/movements`, payload),
  clearStock: (storeId: string, productId: string, payload: ClearStockPayload) =>
    adminAxios.post<ApiResponse<StockMutationResult>>(`/admin/stock/store/${storeId}/product/${productId}/clear`, payload),
  getStoreMovements: (storeId: string, params: StockMovementsParams) =>
    adminAxios.get<PaginatedApiResponse<StockMovement>>(`/admin/stock/store/${storeId}/movements`, { params }),
  getProductMovements: (storeId: string, productId: string, params: StockMovementsParams) =>
    adminAxios.get<PaginatedApiResponse<StockMovement>>(`/admin/stock/store/${storeId}/product/${productId}/movements`, { params }),
  getMovementDetail: (storeId: string, historyId: string) =>
    adminAxios.get<ApiResponse<StockMovement>>(`/admin/stock/store/${storeId}/movements/${historyId}`),
};
