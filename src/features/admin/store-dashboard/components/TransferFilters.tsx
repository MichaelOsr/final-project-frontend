import { parseISO } from "date-fns";
import { Label } from "@/components/ui/label";
import { DatePickerField } from "@/features/admin/shared/components/DatePickerField";
import type { TransferDirection, TransferStatus } from "../types/stockTransfer.types";
import { TRANSFER_STATUS_LABELS } from "../utils/stockTransfer";

const SELECT_CLASS =
  "border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const STATUSES: TransferStatus[] = ["pending", "approved", "rejected", "received", "cancelled"];

interface TransferFiltersProps {
  status: string;
  direction: string;
  startDate: string;
  endDate: string;
  onChange: (updates: Record<string, string | number>) => void;
}

export function TransferFilters({ status, direction, startDate, endDate, onChange }: TransferFiltersProps) {
  return (
    <div className="grid gap-3 border-b border-border px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <select
          className={SELECT_CLASS}
          value={status}
          onChange={(e) => onChange({ status: e.target.value, page: 1 })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{TRANSFER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Direction</Label>
        <select
          className={SELECT_CLASS}
          value={direction}
          onChange={(e) => onChange({ direction: e.target.value, page: 1 })}
        >
          <option value="">All directions</option>
          <option value={"incoming" satisfies TransferDirection}>Incoming</option>
          <option value={"outgoing" satisfies TransferDirection}>Outgoing</option>
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
