import type { AdminRoleOption } from "@/features/admin/shared/types/admin.types";

export function resolveAdminRoles(roles: AdminRoleOption[]) {
  return roles.filter((role) => role.name === "superAdmin" || role.name === "storeAdmin");
}
