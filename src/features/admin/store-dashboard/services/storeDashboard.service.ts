import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type { StoreDashboardSummary, StoreStock } from "../types/storeDashboard.types";

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
};
