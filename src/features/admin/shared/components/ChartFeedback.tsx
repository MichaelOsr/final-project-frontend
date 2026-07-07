import { Loader2Icon } from "lucide-react";

export function ChartLoading({
  message = "Loading report...",
}: {
  message?: string;
}) {
  return (
    <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2Icon className="size-4 animate-spin" />
      {message}
    </div>
  );
}

export function ChartEmpty({
  message = "No data for the selected filters.",
}: {
  message?: string;
}) {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function AccessDenied() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm font-medium">Access denied</p>
      <p className="text-xs text-muted-foreground">
        You do not have permission to view this report.
      </p>
    </div>
  );
}
