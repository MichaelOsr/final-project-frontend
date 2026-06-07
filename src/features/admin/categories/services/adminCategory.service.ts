import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type { AdminCategory } from "../types/adminCategory.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

interface CategoryPayload {
  name: string;
}

export const adminCategoryService = {
  list: (params: Record<string, string | number>) =>
    adminAxios.get<PaginatedApiResponse<AdminCategory>>("/categories", { params }),
  getById: (id: string) =>
    adminAxios.get<ApiResponse<AdminCategory>>(`/categories/${id}`),
  create: (payload: CategoryPayload) =>
    adminAxios.post<ApiResponse<AdminCategory>>("/admin/categories", payload),
  update: (id: string, payload: CategoryPayload) =>
    adminAxios.patch<ApiResponse<AdminCategory>>(`/admin/categories/${id}`, payload),
  delete: (id: string) =>
    adminAxios.delete<ApiResponse<AdminCategory>>(`/admin/categories/${id}`),
};
