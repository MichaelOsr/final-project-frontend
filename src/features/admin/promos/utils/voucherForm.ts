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
  storeId: "",
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
    storeId: voucher.storeId ?? "",
  };
}

function buildBaseVoucherPayload(values: VoucherFormValues) {
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
  };
}

export function buildVoucherPayload(
  values: VoucherFormValues,
  storeId: string,
  isSuperAdmin: boolean,
) {
  return {
    ...buildBaseVoucherPayload(values),
    ...(isSuperAdmin ? { storeId: values.isGlobal ? null : storeId } : {}),
  };
}

// Super admin cross-store scope: empty selection = global voucher (storeId null).
export function buildSuperVoucherPayload(values: VoucherFormValues) {
  return {
    ...buildBaseVoucherPayload(values),
    storeId: values.storeId === "" ? null : values.storeId,
  };
}
