import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { StockReportView } from "@/features/admin/stock-reports/components/StockReportView";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { useStoreContext } from "../hooks/useStoreContext";
import { StockListTab } from "../components/StockListTab";
import { StockTransfersTab } from "../components/StockTransfersTab";

type Tab = "stock" | "report" | "transfers";
const TABS: { value: Tab; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "report", label: "Report" },
  { value: "transfers", label: "Transfers" },
];

const tabClass = (active: boolean) =>
  `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
    active
      ? "border-primary text-primary"
      : "border-transparent text-muted-foreground hover:text-foreground"
  }`;

// Consolidated store inventory page: stock list (+ adjust/clear), the stock
// report (summary + movement history), and transfer requests — all scoped to
// the active store. Store admins are locked to their own store; super admins act
// as a store admin for the store they entered from the dashboard. The report
// endpoint requires storeId, so both roles send the active store here.
export function StoreStockPage() {
  usePageTitle("Stock");
  const navigate = useNavigate();
  const logout = useAdminSessionStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { storeId, isReady, isStoreAdmin } = useStoreContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("tab");
  const tab: Tab = TABS.some((t) => t.value === tabParam) ? (tabParam as Tab) : "stock";

  // Switching tabs starts each tab from a clean slate — the tabs share generic
  // param names (q, type, page, sortBy, startDate…) with different meanings, so
  // leaking them between tabs would build wrong queries.
  function switchTab(next: Tab) {
    const params = new URLSearchParams();
    params.set("tab", next);
    const sid = searchParams.get("storeId");
    if (sid) params.set("storeId", sid);
    setSearchParams(params);
  }

  if (!isReady) {
    // Store admin with no assigned store would otherwise hang on a blank shell
    // (super admins are redirected to /admin/stores by useStoreContext).
    return (
      <AdminDashboardShell>
        {isStoreAdmin ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No store is assigned to your account yet. Contact a super admin to get access.
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoggingOut}
              onClick={async () => {
                setIsLoggingOut(true);
                await logout();
                navigate("/admin/login", { replace: true });
              }}
            >
              Log out
            </Button>
          </div>
        ) : null}
      </AdminDashboardShell>
    );
  }

  return (
    <AdminDashboardShell>
      <div>
        <h1 className="text-xl font-semibold">Stock</h1>
        <p className="text-sm text-muted-foreground">
          Manage inventory, review the stock report, and handle transfers for your store.
        </p>
      </div>

      <div className="flex border-b border-border">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            className={tabClass(tab === value)}
            onClick={() => switchTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "stock" && <StockListTab storeId={storeId} />}
      {tab === "report" && <StockReportView storeId={storeId} isActive />}
      {tab === "transfers" && <StockTransfersTab storeId={storeId} />}
    </AdminDashboardShell>
  );
}
