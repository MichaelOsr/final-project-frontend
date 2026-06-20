import { DatePickerField } from "@/features/admin/shared/components/DatePickerField";

interface Props {
  startDate: string;
  endDate: string;
  onChange: (updates: Record<string, string | number>) => void;
}

export function DiscountReportFilters({ startDate, endDate, onChange }: Props) {
  return (
    <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2">
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
