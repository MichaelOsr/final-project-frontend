import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { AdminUserOverview, PaginationMeta } from "@/features/admin/dashboard/types/adminDashboard.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

export const adminUserService = {
  list: (params: Record<string, string | number>) =>
    adminAxios.get<PaginatedApiResponse<AdminUserOverview>>("/admin/users", { params }),
  getById: (id: string) =>
    adminAxios.get<ApiResponse<AdminUserOverview>>(`/admin/users/${id}`),
};
