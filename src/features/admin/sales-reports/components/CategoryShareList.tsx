import { ChevronRightIcon } from "lucide-react";
import { formatPercentage } from "@/features/admin/shared/utils/adminFormat";
import { formatPrice } from "@/lib/format";
import type { CategoryShare } from "../types/salesReport.types";

interface CategoryShareListProps {
  share: CategoryShare[];
  colorById: Map<string, string>;
  onSelect: (category: CategoryShare) => void;
}

// Clickable rows beside the share pie chart; selecting one opens the
// category trend drilldown dialog. The chevron signals the row is drillable,
// matching the eye-action convention used on the products table.
export function CategoryShareList({ share, colorById, onSelect }: CategoryShareListProps) {
  return (
    <ul className="space-y-1.5">
      {share.map((category) => (
        <li key={category.categoryId}>
          <button
            type="button"
            onClick={() => onSelect(category)}
            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colorById.get(category.categoryId) }}
              />
              <span className="truncate font-medium">{category.categoryName}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-right text-xs text-muted-foreground">
              {formatPrice(category.productSales)} · {formatPercentage(category.percentage)}%
              <ChevronRightIcon className="size-3.5 text-muted-foreground/70" />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
