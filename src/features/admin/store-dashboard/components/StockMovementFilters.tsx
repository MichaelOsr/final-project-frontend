import { parseISO } from "date-fns";
import { Label } from "@/components/ui/label";
import { DatePickerField } from "@/features/admin/shared/components/DatePickerField";
import { STOCK_MOVEMENT_TYPE_GROUPS } from "../utils/stockMovement";

const SELECT_CLASS =
  "border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface StockMovementFiltersProps {
  type: string;
  startDate: string;
  endDate: string;
  onChange: (updates: Record<string, string | number>) => void;
}

export function StockMovementFilters({ type, startDate, endDate, onChange }: StockMovementFiltersProps) {
  return (
    <div className="grid gap-3 border-b border-border px-4 py-3 sm:grid-cols-3">
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Movement type</Label>
        <select
          className={SELECT_CLASS}
          value={type}
          onChange={(event) => onChange({ type: event.target.value, page: 1 })}
        >
          <option value="">All types</option>
          <optgroup label="Increase stock">
            {STOCK_MOVEMENT_TYPE_GROUPS.in.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </optgroup>
          <optgroup label="Decrease stock">
            {STOCK_MOVEMENT_TYPE_GROUPS.out.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </optgroup>
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">From date</Label>
        <DatePickerField
          value={startDate}
          placeholder="From date"
          disabled={(date) => (endDate ? date > parseISO(endDate) : false)}
          onChange={(value) => onChange({ startDate: value, page: 1 })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">To date</Label>
        <DatePickerField
          value={endDate}
          placeholder="To date"
          disabled={(date) => (startDate ? date < parseISO(startDate) : false)}
          onChange={(value) => onChange({ endDate: value, page: 1 })}
        />
      </div>
    </div>
  );
}
