import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import type { SalesReportGranularity } from "../types/salesReport.types";
import { granularityEnabled } from "../utils/granularity";

const OPTIONS: { value: SalesReportGranularity; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

// Controls chart bucketing only (not the summary totals), so it lives in the
// chart header rather than the report-wide filter bar. Options that don't fit
// the selected date range are disabled (see granularityEnabled).
export function GranularityToggle() {
  const [searchParams, setSearchParams] = useSearchParams();
  const granularity = (searchParams.get("granularity") ?? "monthly") as SalesReportGranularity;
  const enabled = granularityEnabled(
    searchParams.get("startDate") ?? "",
    searchParams.get("endDate") ?? "",
  );

  return (
    <div className="inline-flex rounded-md border border-border p-0.5">
      {OPTIONS.map((opt) => {
        const isEnabled = enabled[opt.value];
        return (
          <button
            key={opt.value}
            type="button"
            disabled={!isEnabled}
            title={isEnabled ? undefined : "Not available for the selected date range"}
            onClick={() =>
              setSearchParams(
                updateSearchParams(searchParams, { granularity: opt.value, page: 1 }),
              )
            }
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors",
              isEnabled ? "hover:text-foreground" : "cursor-not-allowed opacity-40",
              granularity === opt.value && isEnabled && "bg-accent text-accent-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
