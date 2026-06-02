import type { AdminRoleOption } from "../types/adminAccount.types";

export function formatRoleName(roleName?: string) {
  if (roleName === "superAdmin") return "Super Admin";
  if (roleName === "storeAdmin") return "Store Admin";
  if (roleName === "user") return "User";
  return roleName ?? "-";
}

export function resolveAdminRoles(roles: AdminRoleOption[]) {
  return roles.filter((role) => role.name === "superAdmin" || role.name === "storeAdmin");
}
