export type VoucherDiscountType = "percentage" | "nominal";
export type VoucherType = "transaction" | "delivery";
export type VoucherSortField =
  | "createdAt" | "updatedAt" | "name" | "code"
  | "quantity" | "startDate" | "endDate" | "storeName";

export interface VoucherStore {
  id: string;
  name: string;
}

export interface Voucher {
  id: string;
  name: string;
  code: string;
  quantity: number;
  storeId: string | null;
  minimumTransaction: number | null;
  maxDiscount: number | null;
  discountType: VoucherDiscountType;
  voucherType: VoucherType;
  value: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  store: VoucherStore | null;
}

export interface VoucherListParams {
  q?: string;
  code?: string;
  storeId?: string;
  discountType?: VoucherDiscountType;
  voucherType?: VoucherType;
  startDate?: string;
  endDate?: string;
  sortBy?: VoucherSortField;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateVoucherPayload {
  name: string;
  code: string;
  quantity: number;
  storeId?: string | null;
  minimumTransaction?: number;
  maxDiscount?: number;
  discountType: VoucherDiscountType;
  voucherType: VoucherType;
  value: number;
  startDate: string;
  endDate: string;
}

export type UpdateVoucherPayload = Partial<CreateVoucherPayload>;

export interface VoucherReportItem {
  id?: string;
  voucherName?: string | null;
  voucherDiscountAmount?: number | null;
  deliveryVoucherName?: string | null;
  deliveryVoucherAmount?: number | null;
  createdAt: string;
}

export interface VoucherReportSummary {
  totalUsage: number;
  totalVoucherDiscountAmount: number;
  totalDeliveryVoucherAmount: number;
  totalDiscountAmount: number;
}

export interface VoucherReportData {
  summary: VoucherReportSummary;
  items: VoucherReportItem[];
}

export interface VoucherReportParams {
  storeId?: string;
  voucherId?: string;
  voucherType?: VoucherType;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "voucherName" | "voucherDiscountAmount" | "deliveryVoucherName" | "deliveryVoucherAmount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface VoucherFormValues {
  name: string;
  code: string;
  quantity: number | "";
  discountType: VoucherDiscountType | "";
  voucherType: VoucherType | "";
  value: number | "";
  minimumTransaction: number | "";
  maxDiscount: number | "";
  startDate: string;
  endDate: string;
  isGlobal: boolean;
}
