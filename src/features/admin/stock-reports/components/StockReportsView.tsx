import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import type { StoreOption } from "@/features/admin/shared/types/admin.types";
import { StockReportView } from "./StockReportView";

interface StockReportsViewProps {
  stores: StoreOption[];
}

// Super admin entry point: cross-store stock report. The store selector lives
// inside StockReportView's filter card (empty = all stores).
export function StockReportsView({ stores }: StockReportsViewProps) {
  usePageTitle("Stock Reports");
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get("storeId") ?? "";

  return (
    <AdminDashboardShell>
      <div>
        <h1 className="text-xl font-semibold">Stock Reports</h1>
        <p className="text-sm text-muted-foreground">
          Stock movement summary and history across stores.
        </p>
      </div>

      <StockReportView storeId={storeId} isActive showStore={!storeId} stores={stores} />
    </AdminDashboardShell>
  );
}
