import type { ReactNode } from "react";
import { parseISO } from "date-fns";
import { Label } from "@/components/ui/label";
import { DatePickerField } from "@/features/admin/shared/components/DatePickerField";
import type { StoreOption } from "@/features/admin/shared/types/admin.types";

interface SalesReportFiltersProps {
  storeId: string;
  startDate: string;
  endDate: string;
  stores: StoreOption[];
  isSuperAdmin: boolean;
  onChange: (updates: Record<string, string | number>) => void;
}

export function SalesReportFilters({
  storeId,
  startDate,
  endDate,
  stores,
  isSuperAdmin,
  onChange,
}: SalesReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-border p-4">
      {isSuperAdmin && (
        <FilterField label="Store">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={storeId}
            onChange={(e) => onChange({ storeId: e.target.value, page: 1 })}
          >
            <option value="">All stores</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </FilterField>
      )}
      <FilterField label="Start Date">
        <DatePickerField
          value={startDate}
          placeholder="Start date"
          disabled={endDate ? (date) => date > parseISO(endDate) : undefined}
          onChange={(value) => onChange({ startDate: value, page: 1 })}
        />
      </FilterField>
      <FilterField label="End Date">
        <DatePickerField
          value={endDate}
          placeholder="End date"
          disabled={startDate ? (date) => date < parseISO(startDate) : undefined}
          onChange={(value) => onChange({ endDate: value, page: 1 })}
        />
      </FilterField>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="w-40 shrink-0">
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
