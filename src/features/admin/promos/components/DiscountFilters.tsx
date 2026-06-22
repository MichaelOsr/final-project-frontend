import { DatePickerField } from "@/features/admin/shared/components/DatePickerField";
import { Input } from "@/components/ui/input";
import type { DiscountType } from "../types/promo.types";

const SELECT_CLASS =
  "border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 w-full";

interface Props {
  q: string;
  type: DiscountType | "";
  startDate: string;
  endDate: string;
  onChange: (updates: Record<string, string | number>) => void;
}

export function DiscountFilters({ q, type, startDate, endDate, onChange }: Props) {
  return (
    <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        placeholder="Search discounts..."
        value={q}
        onChange={(e) => onChange({ q: e.target.value, page: 1 })}
      />
      <select
        className={SELECT_CLASS}
        value={type}
        onChange={(e) => onChange({ type: e.target.value, page: 1 })}
      >
        <option value="">All types</option>
        <option value="percentage">Percentage</option>
        <option value="nominal">Nominal</option>
        <option value="buyXGetY">Buy X Get Y</option>
      </select>
      <DatePickerField
        value={startDate}
        onChange={(v) => onChange({ startDate: v, page: 1 })}
        placeholder="Active from"
      />
      <DatePickerField
        value={endDate}
        onChange={(v) => onChange({ endDate: v, page: 1 })}
        placeholder="Active until"
      />
    </div>
  );
}
