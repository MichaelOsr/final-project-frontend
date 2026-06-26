import type {
  PaginationMeta,
  ResolvedRange,
} from "@/features/admin/shared/types/admin.types";
import type { StockMovementType } from "@/features/admin/store-dashboard/types/stockMovement.types";

// Admin Stock Report — GET /admin/stock/reports
// One request returns summary + movement history items + pagination meta.

export type StockReportSortBy =
  | "createdAt"
  | "productName"
  | "sku"
  | "type"
  | "quantity"
  | "stockBefore"
  | "stockAfter";

export interface StockReportQuery {
  storeId?: string; // required for storeAdmin, optional for superAdmin (omit = all stores)
  startDate?: string; // YYYY-MM-DD, default month-to-date start
  endDate?: string; // YYYY-MM-DD, default today (inclusive)
  productId?: string;
  categoryId?: string;
  q?: string; // product name or SKU
  type?: StockMovementType;
  sortBy?: StockReportSortBy;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number; // max 100
}

export interface StockReportFiltersInfo {
  storeId: string | null;
  startDate: string;
  endDate: string;
  resolvedRange: ResolvedRange;
  productId: string | null;
  categoryId: string | null;
  q: string | null;
  type: StockMovementType | null;
}

export interface StockReportSummary {
  totalMovements: number;
  stockIn: number;
  stockOut: number;
  netChange: number;
  endingStock: number;
  totalProducts: number;
}

export interface StockReportItem {
  historyId: string;
  createdAt: string;
  productId: string;
  productName: string;
  sku: string;
  categoryId: string | null;
  categoryName: string | null;
  storeId: string;
  storeName: string;
  type: StockMovementType;
  quantity: number | null;
  stockBefore: number | null;
  stockAfter: number | null;
  stockIn: number;
  stockOut: number;
  netChange: number;
  admin: { id: string; name: string; email: string } | null;
  transactionId: string | null;
  stockTransferRequestId: string | null;
  notes: string | null;
}

export interface StockReportResponse {
  message: string;
  data: {
    filters: StockReportFiltersInfo;
    summary: StockReportSummary;
    items: StockReportItem[];
  };
  meta: PaginationMeta;
}
