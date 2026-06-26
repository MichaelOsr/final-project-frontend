import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type {
  SalesReportCommonQuery,
  SalesReportFiltersInfo,
  SalesReportStatus,
} from "./salesReport.types";

// GET /transactions — paginated transaction table behind the report filters.
export interface TransactionReportQuery extends SalesReportCommonQuery {
  status?: SalesReportStatus;
  q?: string;
  page?: number;
  limit?: number;
}

export interface TransactionItem {
  transactionId: string;
  transactionStatus: SalesReportStatus;
  store: { id: string; name: string };
  customer: { id: string; name: string | null; email: string | null };
  paidAt: string | null;
  updatedAt: string;
  reportDate: string;
  totalItemsSold: number;
  productSales: number;
  transactionVoucherDiscount: number;
  deliveryRevenue: number;
  totalRevenue: number;
}

export interface TransactionReportResponse {
  message: string;
  data: {
    filters: SalesReportFiltersInfo & {
      status: SalesReportStatus | null;
      q: string | null;
    };
    items: TransactionItem[];
  };
  meta: PaginationMeta;
}
