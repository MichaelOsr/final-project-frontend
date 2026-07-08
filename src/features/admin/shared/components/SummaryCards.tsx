import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SummaryMetric {
  label: string;
  value: string;
  icon: LucideIcon;
}

// `columns` lets callers pick a grid that stays balanced for their card count
// (e.g. a 3-col layout for 6 cards instead of leaving 2 orphans in a 4-col row).
export function SummaryCards({
  metrics,
  columns = "sm:grid-cols-2 xl:grid-cols-4",
}: {
  metrics: SummaryMetric[];
  columns?: string;
}) {
  return (
    <section className={cn("grid gap-3", columns)}>
      {metrics.map(({ label, value, icon: Icon }) => (
        <Card key={label} size="sm" className="rounded-lg">
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
              <Icon className="size-4" />
            </span>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
