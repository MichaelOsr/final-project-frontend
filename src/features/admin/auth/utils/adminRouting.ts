import type { IAdminSessionUser } from "@/types/adminAuthStore.types";

export function getAdminStoreDashboardPath(user: IAdminSessionUser) {
  const storeId = user.store?.id ?? "dummy-store";

  return `/admin/store/dashboard?storeId=${encodeURIComponent(storeId)}`;
}

export function getAdminLandingPath(user: IAdminSessionUser) {
  if (user.role === "storeAdmin") {
    return getAdminStoreDashboardPath(user);
  }

  return "/admin/dashboard";
}
