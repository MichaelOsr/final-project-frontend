import { useAdminSessionStore } from "@/store/adminSession.store";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { useStoreContext } from "@/features/admin/store-dashboard/hooks/useStoreContext";
import { SalesReportsView } from "../components/SalesReportsView";

// Store-context entry point: store admins (and super admins acting as a store
// admin from the store dashboard) see the report scoped to the active store.
export function StoreSalesReportsPage() {
  const admin = useAdminSessionStore((state) => state.user);
  const isSuperAdmin = admin?.role === "superAdmin";
  const { storeId, isReady } = useStoreContext();

  if (!isReady) return <AdminDashboardShell>{null}</AdminDashboardShell>;

  return (
    <SalesReportsView isSuperAdmin={isSuperAdmin} stores={[]} forcedStoreId={storeId} />
  );
}
