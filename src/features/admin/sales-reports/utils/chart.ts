// Shared chart helpers for the sales report feature.
import { formatPrice } from "@/lib/format";

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

// Compact axis labels, e.g. 1500000 -> "1.5M". Keeps Y axes readable.
export function compactNumber(value: number): string {
  return compactFormatter.format(value ?? 0);
}

// Tooltip value formatter compatible with recharts' Formatter signature.
export function currencyTooltip(value: unknown): string {
  return formatPrice(typeof value === "number" ? value : Number(value) || 0);
}

// A stable palette used to colour category series and pie slices.
export const CATEGORY_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#14b8a6",
];

export function categoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}
