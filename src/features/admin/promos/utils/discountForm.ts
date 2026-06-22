import type { Discount, DiscountFormValues, DiscountType } from "../types/promo.types";
import { toIso, toLocalDateTime } from "./dateTime";

export const EMPTY_DISCOUNT_VALUES: DiscountFormValues = {
  name: "",
  type: "",
  value: "",
  buyQuantity: "",
  getQuantity: "",
  quota: "",
  productId: "",
  startDate: "",
  endDate: "",
};

export function toDiscountFormValues(discount: Discount): DiscountFormValues {
  return {
    name: discount.name,
    type: discount.type,
    value: discount.value ?? "",
    buyQuantity: discount.buyQuantity ?? "",
    getQuantity: discount.getQuantity ?? "",
    quota: discount.quota ?? "",
    productId: discount.productId,
    startDate: toLocalDateTime(discount.startDate),
    endDate: toLocalDateTime(discount.endDate),
  };
}

export function buildDiscountPayload(values: DiscountFormValues, storeId: string | null) {
  const base = {
    name: values.name.trim(),
    type: values.type as DiscountType,
    productId: values.productId,
    startDate: toIso(values.startDate),
    endDate: toIso(values.endDate),
    ...(storeId ? { storeId } : {}),
    ...(values.quota !== "" ? { quota: Number(values.quota) } : {}),
  };
  if (values.type === "buyXGetY") {
    return { ...base, buyQuantity: Number(values.buyQuantity), getQuantity: Number(values.getQuantity) };
  }
  return { ...base, value: Number(values.value) };
}
