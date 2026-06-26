import type { SalesReportStatus } from "../types/salesReport.types";

// English labels for the sales report, scoped to this feature so the fix
// doesn't ripple into the shared OrderStatusBadge used by customer-facing
// order pages. Colors mirror OrderStatusBadge for visual consistency.
export const TRANSACTION_STATUS_LABEL: Record<SalesReportStatus, string> = {
  paid: "Paid",
  process: "Process",
  onDelivery: "On Delivery",
  confirmed: "Confirmed",
};

export const TRANSACTION_STATUS_COLOR: Record<
  SalesReportStatus,
  { bg: string; text: string }
> = {
  paid: { bg: "bg-teal-100", text: "text-teal-700" },
  process: { bg: "bg-indigo-100", text: "text-indigo-700" },
  onDelivery: { bg: "bg-cyan-100", text: "text-cyan-700" },
  confirmed: { bg: "bg-green-100", text: "text-green-700" },
};
