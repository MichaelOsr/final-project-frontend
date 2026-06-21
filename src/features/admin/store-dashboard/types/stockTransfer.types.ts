import type { StockMovement } from "./stockMovement.types";

export type TransferStatus = "pending" | "approved" | "rejected" | "received" | "cancelled";
export type TransferDirection = "incoming" | "outgoing";
export type TransferSortField = "createdAt" | "updatedAt" | "productName" | "quantity" | "status";

export interface TransferActor {
  id: string;
  name: string;
  email: string;
}

export interface TransferStore {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
}

export interface TransferProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
}

export interface StockTransferRequest {
  id: string;
  productId: string;
  productName: string;
  fromStoreId: string;
  toStoreId: string;
  requestedById: string;
  approvedById: string | null;
  rejectedById: string | null;
  receivedById: string | null;
  cancelledById: string | null;
  quantity: number;
  notes: string | null;
  status: TransferStatus;
  requestNotes: string | null;
  responseNotes: string | null;
  receivedNotes: string | null;
  cancelledNotes: string | null;
  requestedAt?: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  receivedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product: TransferProduct;
  fromStore: TransferStore;
  toStore: TransferStore;
  requestedBy: TransferActor;
  approvedBy: TransferActor | null;
  rejectedBy: TransferActor | null;
  receivedBy: TransferActor | null;
  cancelledBy: TransferActor | null;
  stockHistories: StockMovement[];
}

export interface TransferSource {
  id: string;
  productId: string;
  storeId: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  store: TransferStore;
  product: TransferProduct;
}

export interface TransferRequestsParams {
  status?: TransferStatus;
  productId?: string;
  fromStoreId?: string;
  toStoreId?: string;
  direction?: TransferDirection;
  startDate?: string;
  endDate?: string;
  sortBy?: TransferSortField;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateTransferPayload {
  productId: string;
  fromStoreId: string;
  toStoreId?: string;
  quantity: number;
  notes?: string;
  requestNotes?: string;
}

export interface TransferActionPayload {
  responseNotes?: string;
  receivedNotes?: string;
  cancelledNotes?: string;
}

export type TransferAction = "approve" | "reject" | "receive" | "cancel";
