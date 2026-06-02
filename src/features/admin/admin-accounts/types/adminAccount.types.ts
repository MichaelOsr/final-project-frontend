import type { AdminRoleName } from "@/types/adminAuthStore.types";
export type { AdminRoleOption } from "@/features/admin/shared/types/admin.types";

export interface AdminAccountPayload {
  name: string;
  email: string;
  password: string;
  roleId: string;
  storeId?: string;
}

export interface UpdateAdminAccountPayload {
  name?: string;
  password?: string;
  roleId?: string;
  storeId?: string | null;
}

export interface CreateAdminAccountFormValues {
  name: string;
  email: string;
  password: string;
  roleName: Extract<AdminRoleName, "superAdmin" | "storeAdmin"> | "";
  storeId: string;
}

export interface EditAdminAccountFormValues {
  name: string;
  password: string;
  roleName: Extract<AdminRoleName, "superAdmin" | "storeAdmin"> | "";
  storeId: string;
}
