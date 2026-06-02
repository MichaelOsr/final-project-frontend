import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { PaginationMeta } from "@/features/admin/dashboard/types/adminDashboard.types";
import type { AdminStore, StorePayload } from "../types/adminStore.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

export const adminStoreService = {
  list: (params: Record<string, string | number>) =>
    adminAxios.get<PaginatedApiResponse<AdminStore>>("/stores", { params }),
  getById: (id: string) => adminAxios.get<ApiResponse<AdminStore>>(`/stores/${id}`),
  create: (payload: StorePayload) =>
    adminAxios.post<ApiResponse<AdminStore>>("/stores", payload),
  update: (id: string, payload: StorePayload) =>
    adminAxios.patch<ApiResponse<AdminStore>>(`/stores/${id}`, payload),
  delete: (id: string) => adminAxios.delete<ApiResponse>(`/stores/${id}`),
};
