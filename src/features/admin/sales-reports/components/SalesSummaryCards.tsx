import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface SummaryMetric {
  label: string;
  value: string;
  icon: LucideIcon;
}

export function SalesSummaryCards({ metrics }: { metrics: SummaryMetric[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon }) => (
        <Card key={label} size="sm" className="rounded-lg">
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
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
