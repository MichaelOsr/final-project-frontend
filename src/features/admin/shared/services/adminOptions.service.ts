import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { AdminRoleOption, StoreOption } from "../types/admin.types";

export const adminOptionsService = {
  listRoles: () => adminAxios.get<ApiResponse<AdminRoleOption[]>>("/roles"),
  listStores: () => adminAxios.get<ApiResponse<StoreOption[]>>("/stores/options"),
};
