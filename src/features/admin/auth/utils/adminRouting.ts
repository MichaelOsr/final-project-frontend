import type { IAdminSessionUser } from "@/types/adminAuthStore.types";

export function getAdminStoreDashboardPath(user: IAdminSessionUser) {
  const storeId = user.store?.id;

  return storeId ? `/admin/store/dashboard?storeId=${encodeURIComponent(storeId)}` : "/admin/store/dashboard";
}

export function getAdminLandingPath(user: IAdminSessionUser) {
  if (user.role === "storeAdmin") {
    return getAdminStoreDashboardPath(user);
  }

  return "/admin/dashboard";
}
