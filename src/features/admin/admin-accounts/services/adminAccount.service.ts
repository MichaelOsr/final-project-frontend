import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { AdminUserOverview } from "@/features/admin/shared/types/admin.types";
import type {
  AdminAccountPayload,
  UpdateAdminAccountPayload,
} from "../types/adminAccount.types";

export const adminAccountService = {
  create: (payload: AdminAccountPayload) =>
    adminAxios.post<ApiResponse<AdminUserOverview>>("/admin/admin-accounts", payload),
  getById: (id: string) =>
    adminAxios.get<ApiResponse<AdminUserOverview>>(`/admin/admin-accounts/${id}`),
  update: (id: string, payload: UpdateAdminAccountPayload) =>
    adminAxios.patch<ApiResponse<AdminUserOverview>>(`/admin/admin-accounts/${id}`, payload),
  delete: (id: string) =>
    adminAxios.delete<ApiResponse>(`/admin/admin-accounts/${id}`),
};
