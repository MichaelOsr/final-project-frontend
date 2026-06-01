import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { useAdminSessionStore } from "@/store/adminSession.store";
import type { AdminRoleName } from "@/types/adminAuthStore.types";
import { getAdminStoreDashboardPath } from "../utils/adminRouting";

export function AdminProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: AdminRoleName[];
}) {
  const user = useAdminSessionStore((state) => state.user);
  const status = useAdminSessionStore((state) => state.status);

  if (status === "loading") {
    return <FullScreenLoader />;
  }

  if (status === "unauthenticated" || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    if (user.role === "storeAdmin") {
      return <Navigate to={getAdminStoreDashboardPath(user)} replace />;
    }

    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
