import { useEffect, useState } from "react";
import { adminOptionsService } from "@/features/admin/shared/services/adminOptions.service";
import type { StoreOption } from "@/features/admin/shared/types/admin.types";
import { StockReportsView } from "../components/StockReportsView";

// Super admin entry point: cross-store stock report with an optional store filter.
export function StockReportsPage() {
  const [stores, setStores] = useState<StoreOption[]>([]);

  useEffect(() => {
    adminOptionsService
      .listStores()
      .then((res) => setStores(res.data.data ?? []))
      .catch(() => {});
  }, []);

  return <StockReportsView stores={stores} />;
}
