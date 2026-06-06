import type { IAdminSessionUser } from "@/types/adminAuthStore.types";

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export type AdminAuthResponseData = IAdminSessionUser;
