import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type { AdminStore } from "../types/adminStore.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

export const adminStoreService = {
  list: (params: Record<string, string | number>) =>
    adminAxios.get<PaginatedApiResponse<AdminStore>>("/stores", { params }),
  getById: (id: string) => adminAxios.get<ApiResponse<AdminStore>>(`/stores/${id}`),
};
