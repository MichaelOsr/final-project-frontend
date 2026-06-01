import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminSessionStore } from "@/store/adminSession.store";

export function AdminPublicOnlyRoute({
  children,
}: {
  children: ReactNode;
}) {
  const user = useAdminSessionStore((state) => state.user);
  const isHydrated = useAdminSessionStore((state) => state.isHydrated);

  if (!isHydrated) {
    return null;
  }

  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
