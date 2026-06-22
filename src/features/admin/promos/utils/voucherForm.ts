import type {
  Voucher,
  VoucherDiscountType,
  VoucherFormValues,
  VoucherType,
} from "../types/voucher.types";
import { toIso, toLocalDateTime } from "./dateTime";

export const EMPTY_VOUCHER_VALUES: VoucherFormValues = {
  name: "",
  code: "",
  quantity: "",
  discountType: "",
  voucherType: "",
  value: "",
  minimumTransaction: "",
  maxDiscount: "",
  startDate: "",
  endDate: "",
  isGlobal: false,
};

export function toVoucherFormValues(voucher: Voucher): VoucherFormValues {
  return {
    name: voucher.name,
    code: voucher.code,
    quantity: voucher.quantity,
    discountType: voucher.discountType,
    voucherType: voucher.voucherType,
    value: voucher.value,
    minimumTransaction: voucher.minimumTransaction ?? "",
    maxDiscount: voucher.maxDiscount ?? "",
    startDate: toLocalDateTime(voucher.startDate),
    endDate: toLocalDateTime(voucher.endDate),
    isGlobal: voucher.storeId === null,
  };
}

export function buildVoucherPayload(
  values: VoucherFormValues,
  storeId: string,
  isSuperAdmin: boolean,
) {
  const isPercentage = values.discountType === "percentage";
  return {
    name: values.name.trim(),
    code: values.code.trim(),
    quantity: Number(values.quantity),
    discountType: values.discountType as VoucherDiscountType,
    voucherType: values.voucherType as VoucherType,
    value: Number(values.value),
    ...(values.minimumTransaction !== ""
      ? { minimumTransaction: Number(values.minimumTransaction) }
      : {}),
    ...(isPercentage && values.maxDiscount !== ""
      ? { maxDiscount: Number(values.maxDiscount) }
      : {}),
    startDate: toIso(values.startDate),
    endDate: toIso(values.endDate),
    ...(isSuperAdmin ? { storeId: values.isGlobal ? null : storeId } : {}),
  };
}
