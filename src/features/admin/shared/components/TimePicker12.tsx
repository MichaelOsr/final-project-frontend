import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

interface Props {
  date?: Date;
  onChange: (hours24: number, minutes: number) => void;
}

export function TimePicker12({ date, onChange }: Props) {
  const disabled = !date;
  const hours24 = date ? date.getHours() : 0;
  const minutes = date ? date.getMinutes() : 0;
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hour12 = hours24 % 12 || 12;

  function emit(nextHour12: number, nextMinutes: number, nextMeridiem: string) {
    const base = nextHour12 % 12;
    onChange(base + (nextMeridiem === "PM" ? 12 : 0), nextMinutes);
  }

  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">Time</Label>
      <div className="flex items-center gap-2">
        <TimeSelect
          ariaLabel="Hour"
          value={String(hour12)}
          disabled={disabled}
          onValueChange={(v) => emit(Number(v), minutes, meridiem)}
          options={HOURS.map((h) => ({ value: String(h), label: String(h) }))}
        />
        <span className="text-muted-foreground">:</span>
        <TimeSelect
          ariaLabel="Minute"
          value={String(minutes)}
          disabled={disabled}
          onValueChange={(v) => emit(hour12, Number(v), meridiem)}
          options={MINUTES.map((m) => ({
            value: String(m),
            label: String(m).padStart(2, "0"),
          }))}
        />
        <TimeSelect
          ariaLabel="AM or PM"
          value={meridiem}
          disabled={disabled}
          onValueChange={(v) => emit(hour12, minutes, v)}
          options={[
            { value: "AM", label: "AM" },
            { value: "PM", label: "PM" },
          ]}
        />
      </div>
    </div>
  );
}

interface TimeSelectProps {
  ariaLabel: string;
  value: string;
  disabled: boolean;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function TimeSelect({
  ariaLabel,
  value,
  disabled,
  onValueChange,
  options,
}: TimeSelectProps) {
  return (
    <Select value={value} disabled={disabled} onValueChange={onValueChange}>
      <SelectTrigger size="sm" aria-label={ariaLabel} className="w-16">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
