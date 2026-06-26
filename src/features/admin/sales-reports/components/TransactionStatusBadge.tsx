import type { SalesReportStatus } from "../types/salesReport.types";
import { TRANSACTION_STATUS_COLOR, TRANSACTION_STATUS_LABEL } from "../utils/transactionStatus";

export function TransactionStatusBadge({ status }: { status: SalesReportStatus }) {
  const { bg, text } = TRANSACTION_STATUS_COLOR[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg} ${text}`}>
      {TRANSACTION_STATUS_LABEL[status]}
    </span>
  );
}
