import { DatePickerField } from "@/features/admin/shared/components/DatePickerField";
import { Input } from "@/components/ui/input";
import type { VoucherDiscountType, VoucherType } from "../types/voucher.types";

const SELECT_CLASS =
  "border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 w-full";

interface Props {
  q: string;
  discountType: VoucherDiscountType | "";
  voucherType: VoucherType | "";
  startDate: string;
  endDate: string;
  onChange: (updates: Record<string, string | number>) => void;
}

export function VoucherFilters({ q, discountType, voucherType, startDate, endDate, onChange }: Props) {
  return (
    <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      <Input
        placeholder="Search vouchers..."
        value={q}
        onChange={(e) => onChange({ q: e.target.value, page: 1 })}
      />
      <select
        className={SELECT_CLASS}
        value={discountType}
        onChange={(e) => onChange({ discountType: e.target.value, page: 1 })}
      >
        <option value="">All discount types</option>
        <option value="percentage">Percentage</option>
        <option value="nominal">Nominal</option>
      </select>
      <select
        className={SELECT_CLASS}
        value={voucherType}
        onChange={(e) => onChange({ voucherType: e.target.value, page: 1 })}
      >
        <option value="">All voucher types</option>
        <option value="transaction">Transaction</option>
        <option value="delivery">Delivery</option>
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
