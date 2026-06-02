import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { AdminUserOverview, PaginationMeta, StoreOverview } from "@/features/admin/dashboard/types/adminDashboard.types";
import type {
  AdminAccountPayload,
  AdminRoleOption,
  UpdateAdminAccountPayload,
} from "../types/adminAccount.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

export const adminAccountService = {
  create: (payload: AdminAccountPayload) =>
    adminAxios.post<ApiResponse<AdminUserOverview>>("/admin/admin-accounts", payload),
  list: (params: Record<string, string | number>) =>
    adminAxios.get<PaginatedApiResponse<AdminUserOverview>>("/admin/admin-accounts", { params }),
  getById: (id: string) =>
    adminAxios.get<ApiResponse<AdminUserOverview>>(`/admin/admin-accounts/${id}`),
  update: (id: string, payload: UpdateAdminAccountPayload) =>
    adminAxios.patch<ApiResponse<AdminUserOverview>>(`/admin/admin-accounts/${id}`, payload),
  delete: (id: string) =>
    adminAxios.delete<ApiResponse>(`/admin/admin-accounts/${id}`),
  listRoles: () => adminAxios.get<ApiResponse<AdminRoleOption[]>>("/roles"),
  listStores: () =>
    adminAxios.get<PaginatedApiResponse<StoreOverview>>("/stores", {
      params: {
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      },
    }),
};
