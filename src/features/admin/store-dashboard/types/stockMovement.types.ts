import type { StoreStock } from "./storeDashboard.types";

export type StockMovementType =
  | "purchase"
  | "sale"
  | "returnIn"
  | "returnOut"
  | "adjustmentIn"
  | "adjustmentOut"
  | "transferIn"
  | "transferOut"
  | "damaged"
  | "expired"
  | "lost";

export interface StockMovement {
  id: string;
  name: string;
  quantity: number | null;
  stockBefore: number | null;
  stockAfter: number | null;
  productId: string;
  storeId: string;
  adminId: string | null;
  transactionId: string | null;
  type: StockMovementType;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product: { id: string; name: string; slug: string; sku: string };
  store: { id: string; name: string };
  admin: { id: string; name: string; email: string } | null;
  transaction: null;
}

export interface CreateMovementPayload {
  type: StockMovementType;
  quantity: number;
  notes?: string;
}

export interface ClearStockPayload {
  notes?: string;
}

export type StockMovementSortField =
  | "createdAt"
  | "updatedAt"
  | "name"
  | "type"
  | "quantity"
  | "stockBefore"
  | "stockAfter"
  | "productName"
  | "storeName"
  | "adminName";

export type SortOrder = "asc" | "desc";

export interface StockMovementsParams {
  productId?: string;
  type?: StockMovementType;
  startDate?: string;
  endDate?: string;
  sortBy?: StockMovementSortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface StockMutationResult {
  stock: StoreStock;
  history: StockMovement | null;
}
