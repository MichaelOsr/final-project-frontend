import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { AccessDenied } from "@/features/admin/shared/components/ChartFeedback";
import { updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import type { StoreOption } from "@/features/admin/shared/types/admin.types";
import { SalesReportFilters } from "./SalesReportFilters";
import { SalesSummarySection } from "./SalesSummarySection";
import { TransactionsTab } from "./TransactionsTab";
import { CategorySalesTab } from "./CategorySalesTab";
import { ProductSalesTab } from "./ProductSalesTab";
import { granularityEnabled, pickGranularity } from "../utils/granularity";
import type {
  SalesReportCommonQuery,
  SalesReportGranularity,
} from "../types/salesReport.types";

// Tab-specific params that must not leak across tabs (e.g. a product search
// query showing up after switching to Transactions).
const TAB_SCOPED_PARAMS = ["q", "status", "categoryId", "sortBy", "sortOrder"];

type Tab = "transactions" | "categories" | "products";
const TABS: { value: Tab; label: string }[] = [
  { value: "transactions", label: "Transactions" },
  { value: "categories", label: "By Category" },
  { value: "products", label: "By Product" },
];

const tabClass = (active: boolean) =>
  `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
    active
      ? "border-primary text-primary"
      : "border-transparent text-muted-foreground hover:text-foreground"
  }`;

interface SalesReportsViewProps {
  isSuperAdmin: boolean;
  stores: StoreOption[];
  // When set, the report is locked to a single store (store-context mode) and
  // the store filter is hidden. Otherwise super admins may filter across stores.
  forcedStoreId?: string;
}

export function SalesReportsView({ isSuperAdmin, stores, forcedStoreId }: SalesReportsViewProps) {
  usePageTitle("Sales Reports");
  const [searchParams, setSearchParams] = useSearchParams();
  // Tracks the exact query object that was denied access, rather than a
  // plain boolean, so a new filter combination (new query reference) is
  // automatically treated as unverified again without a reset effect.
  const [deniedQuery, setDeniedQuery] = useState<SalesReportCommonQuery | null>(null);
  const showStoreFilter = isSuperAdmin && !forcedStoreId;

  const tab = (searchParams.get("tab") ?? "transactions") as Tab;
  const granularity = (searchParams.get("granularity") ?? "monthly") as SalesReportGranularity;
  const storeId = forcedStoreId ?? searchParams.get("storeId") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const query = useMemo<SalesReportCommonQuery>(
    () => ({
      granularity,
      ...(storeId ? { storeId } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    }),
    [granularity, storeId, startDate, endDate],
  );

  function update(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  // Switching tabs drops the previous tab's own filters (search, status,
  // category, sort) so they don't silently carry over into the next tab.
  function switchTab(value: Tab) {
    const cleared = Object.fromEntries(TAB_SCOPED_PARAMS.map((key) => [key, ""]));
    update({ ...cleared, tab: value, page: 1 });
  }

  // Keep granularity valid for the selected range: if the range no longer
  // supports the active granularity (e.g. switched to a 3-day range while on
  // "yearly"), fall back to the finest one that fits.
  useEffect(() => {
    const enabled = granularityEnabled(startDate, endDate);
    if (enabled[granularity]) return;
    const next = pickGranularity(enabled);
    if (!next) return;
    setSearchParams(
      (prev) => updateSearchParams(prev, { granularity: next, page: 1 }),
      { replace: true },
    );
  }, [granularity, startDate, endDate, setSearchParams]);

  const accessDenied = deniedQuery === query;
  const handleSummaryForbidden = useCallback(() => setDeniedQuery(query), [query]);

  return (
    <AdminDashboardShell>
      <div>
        <h1 className="text-xl font-semibold">Sales Reports</h1>
        <p className="text-sm text-muted-foreground">
          Sales performance by store, category, and product across any time range.
        </p>
      </div>

      <SalesReportFilters
        storeId={showStoreFilter ? storeId : ""}
        startDate={startDate}
        endDate={endDate}
        stores={stores}
        isSuperAdmin={showStoreFilter}
        onChange={update}
      />

      <SalesSummarySection query={query} onForbidden={handleSummaryForbidden} />

      {accessDenied ? (
        <AccessDenied />
      ) : (
        <>
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

          {tab === "transactions" && (
            <TransactionsTab query={query} isActive forcedStoreId={forcedStoreId} />
          )}
          {tab === "categories" && <CategorySalesTab query={query} isActive />}
          {tab === "products" && <ProductSalesTab query={query} isActive />}
        </>
      )}
    </AdminDashboardShell>
  );
}
