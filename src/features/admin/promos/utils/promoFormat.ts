import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import type { Discount, DiscountType } from "../types/promo.types";

const TYPE_LABELS: Record<DiscountType, string> = {
  percentage: "Percentage",
  nominal: "Nominal",
  buyXGetY: "Buy X Get Y",
};

export function formatDiscountType(type: DiscountType): string {
  return TYPE_LABELS[type] ?? type;
}

export function formatDiscountValue(discount: Discount): string {
  if (discount.type === "buyXGetY") {
    return `Buy ${discount.buyQuantity} Get ${discount.getQuantity}`;
  }
  if (discount.type === "percentage") return `${discount.value}%`;
  return formatRupiah(discount.value ?? 0);
}

export function formatDiscountWindow(discount: Discount): string {
  return `${formatDate(discount.startDate)} – ${formatDate(discount.endDate)}`;
}

export function isDiscountActive(discount: Discount): boolean {
  if (discount.deletedAt) return false;
  const now = new Date();
  return new Date(discount.startDate) <= now && now <= new Date(discount.endDate);
}

export function formatQuota(discount: Discount): string {
  const used = discount.usedQuota ?? 0;
  if (discount.quota === null || discount.quota === undefined) return `${used} / Unlimited`;
  return `${used} / ${discount.quota}`;
}

export function formatVoucherValue(voucher: {
  discountType: string;
  value: number;
  maxDiscount?: number | null;
}): string {
  if (voucher.discountType !== "percentage") return formatRupiah(voucher.value);
  const cap = voucher.maxDiscount ? `, max ${formatRupiah(voucher.maxDiscount)}` : "";
  return `${voucher.value}%${cap}`;
}

export function formatVoucherScope(voucher: { storeId: string | null; store?: { name: string } | null }): string {
  if (voucher.storeId === null) return "Global";
  return voucher.store?.name ?? "Store";
}

export type VoucherStatus = "Scheduled" | "Active" | "Expired" | "Out of quota";

export function getVoucherStatus(voucher: {
  deletedAt: string | null;
  startDate: string;
  endDate: string;
  quantity: number;
}): VoucherStatus {
  const now = new Date();
  if (voucher.deletedAt || now > new Date(voucher.endDate)) return "Expired";
  if (now < new Date(voucher.startDate)) return "Scheduled";
  if (voucher.quantity <= 0) return "Out of quota";
  return "Active";
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
