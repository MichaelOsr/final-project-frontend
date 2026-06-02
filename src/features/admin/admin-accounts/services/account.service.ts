import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { AdminUserOverview, PaginationMeta } from "@/features/admin/shared/types/admin.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

export const accountService = {
  list: (params: Record<string, string | number>) =>
    adminAxios.get<PaginatedApiResponse<AdminUserOverview>>("/admin/users", { params }),
  getById: (id: string) =>
    adminAxios.get<ApiResponse<AdminUserOverview>>(`/admin/users/${id}`),
};
