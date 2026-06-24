import { useEffect, useState } from "react";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { adminOptionsService } from "@/features/admin/shared/services/adminOptions.service";
import type { StoreOption } from "@/features/admin/shared/types/admin.types";
import { SalesReportsView } from "../components/SalesReportsView";

// Super admin entry point: cross-store report with an optional store filter.
export function SalesReportsPage() {
  const admin = useAdminSessionStore((state) => state.user);
  const isSuperAdmin = admin?.role === "superAdmin";
  const [stores, setStores] = useState<StoreOption[]>([]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    adminOptionsService
      .listStores()
      .then((res) => setStores(res.data.data ?? []))
      .catch(() => {});
  }, [isSuperAdmin]);

  return <SalesReportsView isSuperAdmin={isSuperAdmin} stores={stores} />;
}
