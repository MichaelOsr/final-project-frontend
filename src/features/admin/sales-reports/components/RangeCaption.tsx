import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import type { ResolvedRange } from "../types/salesReport.types";

// Shows the exact date window the totals cover, so "summary vs granularity"
// is unambiguous (granularity only buckets the chart, not the totals).
export function RangeCaption({ range }: { range: ResolvedRange | null }) {
  if (!range) return null;
  return (
    <p className="text-xs text-muted-foreground">
      Totals for {formatDate(range.startDate)} – {formatDate(range.endDate)}
    </p>
  );
}
