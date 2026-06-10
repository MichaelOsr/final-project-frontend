import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { getAdminLandingPath } from "../utils/adminRouting";

export function AdminPublicOnlyRoute({ children }: { children: ReactNode }) {
  const user = useAdminSessionStore((state) => state.user);
  const status = useAdminSessionStore((state) => state.status);

  if (status === "loading") {
    return <FullScreenLoader />;
  }

  if (status === "authenticated" && user) {
    return <Navigate to={getAdminLandingPath(user)} replace />;
  }

  return <>{children}</>;
}
