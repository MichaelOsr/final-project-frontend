import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";

export function DashboardLoadingState() {
  return (
    <AdminDashboardShell>
      <div className="grid min-h-[420px] place-items-center rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Loading dashboard data
        </div>
      </div>
    </AdminDashboardShell>
  );
}

export function DashboardErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <AdminDashboardShell>
      <Card className="rounded-lg border-destructive/30 bg-destructive/5">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-destructive">
              Dashboard could not load
            </p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <Button type="button" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </CardContent>
      </Card>
    </AdminDashboardShell>
  );
}
