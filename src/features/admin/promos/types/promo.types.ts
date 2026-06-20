export type DiscountType = "percentage" | "nominal" | "buyXGetY";
export type DiscountSortField =
  | "createdAt" | "updatedAt" | "name" | "type"
  | "startDate" | "endDate" | "productName" | "storeName";

export interface DiscountProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
}

export interface DiscountStore {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
}

export interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  buyQuantity: number | null;
  getQuantity: number | null;
  value: number | null;
  quota: number | null;
  usedQuota: number;
  productId: string;
  storeId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product: DiscountProduct;
  store: DiscountStore;
}

export interface DiscountListParams {
  q?: string;
  storeId?: string;
  productId?: string;
  type?: DiscountType;
  startDate?: string;
  endDate?: string;
  sortBy?: DiscountSortField;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateDiscountPayload {
  name: string;
  type: DiscountType;
  value?: number;
  buyQuantity?: number;
  getQuantity?: number;
  quota?: number;
  productId: string;
  storeId?: string;
  startDate: string;
  endDate: string;
}

export type UpdateDiscountPayload = Partial<Omit<CreateDiscountPayload, "storeId">>;

export interface DiscountReportItem {
  id?: string;
  discountId?: string;
  discountName: string;
  discountAmount: number;
  createdAt: string;
  product?: DiscountProduct;
}

export interface DiscountReportSummary {
  totalUsage: number;
  totalDiscountAmount: number;
}

export interface DiscountReportData {
  summary: DiscountReportSummary;
  items: DiscountReportItem[];
}

export interface DiscountReportParams {
  storeId?: string;
  productId?: string;
  discountId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "discountName" | "discountAmount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface DiscountFormValues {
  name: string;
  type: DiscountType | "";
  value: number | "";
  buyQuantity: number | "";
  getQuantity: number | "";
  quota: number | "";
  productId: string;
  startDate: string;
  endDate: string;
}
