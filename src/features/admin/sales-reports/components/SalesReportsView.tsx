import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import type { StoreOption } from "@/features/admin/shared/types/admin.types";
import { SalesReportFilters } from "./SalesReportFilters";
import { SalesOverviewTab } from "./SalesOverviewTab";
import { CategorySalesTab } from "./CategorySalesTab";
import { ProductSalesTab } from "./ProductSalesTab";
import { granularityEnabled, pickGranularity } from "../utils/granularity";
import type {
  SalesReportCommonQuery,
  SalesReportGranularity,
} from "../types/salesReport.types";

type Tab = "overview" | "category" | "product";
const TABS: { value: Tab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "category", label: "By Category" },
  { value: "product", label: "By Product" },
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
  const showStoreFilter = isSuperAdmin && !forcedStoreId;

  const tab = (searchParams.get("tab") ?? "overview") as Tab;
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

      <div className="flex border-b border-border">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            className={tabClass(tab === value)}
            onClick={() => update({ tab: value, page: 1 })}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && <SalesOverviewTab query={query} isActive />}
      {tab === "category" && <CategorySalesTab query={query} isActive />}
      {tab === "product" && <ProductSalesTab query={query} isActive />}
    </AdminDashboardShell>
  );
}
