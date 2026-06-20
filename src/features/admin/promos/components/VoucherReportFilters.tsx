import { DatePickerField } from "@/features/admin/shared/components/DatePickerField";
import type { VoucherType } from "../types/voucher.types";

const SELECT_CLASS =
  "border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 w-full";

interface Props {
  voucherType: VoucherType | "";
  startDate: string;
  endDate: string;
  onChange: (updates: Record<string, string | number>) => void;
}

export function VoucherReportFilters({ voucherType, startDate, endDate, onChange }: Props) {
  return (
    <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-3">
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
        placeholder="Start date"
      />
      <DatePickerField
        value={endDate}
        onChange={(v) => onChange({ endDate: v, page: 1 })}
        placeholder="End date"
      />
    </div>
  );
}
