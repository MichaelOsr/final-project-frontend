import type { SalesReportGranularity } from "../types/salesReport.types";

// Backend bucket caps (api-docs: max periods per granularity).
const MAX_BUCKETS: Record<SalesReportGranularity, number> = {
  daily: 366,
  monthly: 24,
  yearly: 10,
};

const DAY_MS = 86_400_000;

function parse(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Which granularities make sense for the selected range. A granularity is
// disabled when it would collapse the range into a single bucket (too coarse)
// or exceed the backend bucket cap (too fine). Without a full range, all are
// allowed because the backend applies a sensible default range per granularity.
export function granularityEnabled(
  startDate: string,
  endDate: string,
): Record<SalesReportGranularity, boolean> {
  const start = parse(startDate);
  // When only a start is set the effective range runs to today; without a start
  // we can't bound the range, so every option stays enabled (backend defaults).
  const end = parse(endDate) ?? (start ? new Date() : null);
  if (!start || !end || end < start) {
    return { daily: true, monthly: true, yearly: true };
  }

  const days = Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1;
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;
  const years = end.getFullYear() - start.getFullYear() + 1;

  return {
    daily: days <= MAX_BUCKETS.daily,
    monthly: months >= 2 && months <= MAX_BUCKETS.monthly,
    yearly: years >= 2 && years <= MAX_BUCKETS.yearly,
  };
}

// Best fallback when the active granularity becomes invalid: finest that fits.
// Returns null when no granularity fits the range (e.g. a multi-decade span);
// the caller then leaves the selection alone and lets the backend report the
// "range cannot exceed N periods" error.
export function pickGranularity(
  enabled: Record<SalesReportGranularity, boolean>,
): SalesReportGranularity | null {
  if (enabled.daily) return "daily";
  if (enabled.monthly) return "monthly";
  if (enabled.yearly) return "yearly";
  return null;
}
