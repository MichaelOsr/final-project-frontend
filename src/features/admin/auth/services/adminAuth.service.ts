import adminAxios, { withAdminRefreshBypass } from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type {
  AdminAuthResponseData,
  AdminLoginPayload,
} from "../types/adminAuth.types";

export const adminAuthService = {
  login: (payload: AdminLoginPayload) =>
    adminAxios.post<ApiResponse<AdminAuthResponseData>>(
      "/admin/auth/login",
      payload,
      withAdminRefreshBypass(),
    ),
};
