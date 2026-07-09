import type { SalesReportStatus } from "../types/salesReport.types";

// English labels for the sales report, scoped to this feature so the fix
// doesn't ripple into the shared OrderStatusBadge used by customer-facing
// order pages. Colors mirror OrderStatusBadge for visual consistency.
export const TRANSACTION_STATUS_LABEL: Record<SalesReportStatus, string> = {
  confirmed: "Confirmed",
};

export const TRANSACTION_STATUS_COLOR: Record<
  SalesReportStatus,
  { bg: string; text: string }
> = {
  confirmed: { bg: "bg-green-100", text: "text-green-700" },
};
