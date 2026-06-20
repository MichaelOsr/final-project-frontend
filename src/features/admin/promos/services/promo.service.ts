import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type {
  Discount,
  DiscountListParams,
  CreateDiscountPayload,
  UpdateDiscountPayload,
  DiscountReportData,
  DiscountReportParams,
} from "../types/promo.types";
import type {
  Voucher,
  VoucherListParams,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  VoucherReportData,
  VoucherReportParams,
} from "../types/voucher.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

interface ReportApiResponse<T> {
  message?: string;
  data?: T;
  meta?: PaginationMeta;
}

export const discountService = {
  list: (params: DiscountListParams) =>
    adminAxios.get<PaginatedApiResponse<Discount>>("/admin/discounts", { params }),
  get: (id: string) =>
    adminAxios.get<ApiResponse<Discount>>(`/admin/discounts/${id}`),
  create: (payload: CreateDiscountPayload) =>
    adminAxios.post<ApiResponse<Discount>>("/admin/discounts", payload),
  update: (id: string, payload: UpdateDiscountPayload) =>
    adminAxios.patch<ApiResponse<Discount>>(`/admin/discounts/${id}`, payload),
  remove: (id: string) =>
    adminAxios.delete<ApiResponse<Discount>>(`/admin/discounts/${id}`),
};

export const voucherService = {
  list: (params: VoucherListParams) =>
    adminAxios.get<PaginatedApiResponse<Voucher>>("/admin/vouchers", { params }),
  get: (id: string) =>
    adminAxios.get<ApiResponse<Voucher>>(`/admin/vouchers/${id}`),
  create: (payload: CreateVoucherPayload) =>
    adminAxios.post<ApiResponse<Voucher>>("/admin/vouchers", payload),
  update: (id: string, payload: UpdateVoucherPayload) =>
    adminAxios.patch<ApiResponse<Voucher>>(`/admin/vouchers/${id}`, payload),
  remove: (id: string) =>
    adminAxios.delete<ApiResponse<Voucher>>(`/admin/vouchers/${id}`),
};

export const promoReportService = {
  discounts: (params: DiscountReportParams) =>
    adminAxios.get<ReportApiResponse<DiscountReportData>>("/admin/promo-reports/discounts", { params }),
  vouchers: (params: VoucherReportParams) =>
    adminAxios.get<ReportApiResponse<VoucherReportData>>("/admin/promo-reports/vouchers", { params }),
};
