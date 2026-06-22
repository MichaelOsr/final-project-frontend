import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type { AdminStore, StorePayload } from "../types/adminStore.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

export const adminStoreService = {
  list: (params: Record<string, string | number>) =>
    adminAxios.get<PaginatedApiResponse<AdminStore>>("/stores", { params }),
  getById: (id: string) => adminAxios.get<ApiResponse<AdminStore>>(`/stores/${id}`),
  create: (payload: StorePayload) =>
    adminAxios.post<ApiResponse<AdminStore>>("/admin/stores", payload),
  update: (id: string, payload: Partial<StorePayload>) =>
    adminAxios.patch<ApiResponse<AdminStore>>(`/admin/stores/${id}`, payload),
  delete: (id: string) =>
    adminAxios.delete<ApiResponse<void>>(`/admin/stores/${id}`),
};
