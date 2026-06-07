import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { AdminUserOverview, PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type {
  AdminAccountPayload,
  UpdateAdminAccountPayload,
} from "../types/adminAccount.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

export const adminAccountService = {
  list: (params: Record<string, string | number | boolean>) =>
    adminAxios.get<PaginatedApiResponse<AdminUserOverview>>("/admin/admin-accounts", { params }),
  create: (payload: AdminAccountPayload) =>
    adminAxios.post<ApiResponse<AdminUserOverview>>("/admin/admin-accounts", payload),
  getById: (id: string) =>
    adminAxios.get<ApiResponse<AdminUserOverview>>(`/admin/admin-accounts/${id}`),
  update: (id: string, payload: UpdateAdminAccountPayload) =>
    adminAxios.patch<ApiResponse<AdminUserOverview>>(`/admin/admin-accounts/${id}`, payload),
  delete: (id: string) =>
    adminAxios.delete<ApiResponse>(`/admin/admin-accounts/${id}`),
};
