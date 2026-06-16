import type { StockMovementType } from "../types/stockMovement.types";

export type StockMovementDirection = "in" | "out";

interface StockMovementMeta {
  label: string;
  direction: StockMovementDirection;
}

export const STOCK_MOVEMENT_META: Record<StockMovementType, StockMovementMeta> = {
  purchase: { label: "Purchase", direction: "in" },
  returnIn: { label: "Return In", direction: "in" },
  adjustmentIn: { label: "Adjustment In", direction: "in" },
  transferIn: { label: "Transfer In", direction: "in" },
  sale: { label: "Sale", direction: "out" },
  returnOut: { label: "Return Out", direction: "out" },
  adjustmentOut: { label: "Adjustment Out", direction: "out" },
  transferOut: { label: "Transfer Out", direction: "out" },
  damaged: { label: "Damaged", direction: "out" },
  expired: { label: "Expired", direction: "out" },
  lost: { label: "Lost", direction: "out" },
};

export const STOCK_MOVEMENT_TYPE_OPTIONS = (Object.keys(STOCK_MOVEMENT_META) as StockMovementType[]).map((value) => ({
  value,
  label: STOCK_MOVEMENT_META[value].label,
  direction: STOCK_MOVEMENT_META[value].direction,
}));

export const STOCK_MOVEMENT_TYPE_GROUPS = {
  in: STOCK_MOVEMENT_TYPE_OPTIONS.filter((option) => option.direction === "in"),
  out: STOCK_MOVEMENT_TYPE_OPTIONS.filter((option) => option.direction === "out"),
};

export function getMovementDirection(type: StockMovementType): StockMovementDirection {
  return STOCK_MOVEMENT_META[type].direction;
}

export function getMovementLabel(type: StockMovementType): string {
  return STOCK_MOVEMENT_META[type].label;
}

export function getMovementBadgeClass(type: StockMovementType): string {
  return getMovementDirection(type) === "in" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
}

export function previewStockAfter(currentStock: number, type: StockMovementType, quantity: number): number {
  const sign = getMovementDirection(type) === "in" ? 1 : -1;
  return currentStock + sign * quantity;
}
