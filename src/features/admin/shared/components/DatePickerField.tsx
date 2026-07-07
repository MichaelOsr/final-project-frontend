import { format, parseISO } from "date-fns";
import { CalendarIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker12 } from "./TimePicker12";

interface DatePickerFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  withTime?: boolean;
}

const DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm";

export function DatePickerField({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  withTime = false,
}: DatePickerFieldProps) {
  const selected = value ? parseISO(value) : undefined;

  function handleDateSelect(date: Date | undefined) {
    if (!date) return onChange("");
    if (!withTime) return onChange(format(date, "yyyy-MM-dd"));
    const next = new Date(date);
    next.setHours(selected?.getHours() ?? 0, selected?.getMinutes() ?? 0, 0, 0);
    onChange(format(next, DATE_TIME_FORMAT));
  }

  function handleTimeChange(hours24: number, minutes: number) {
    if (!selected) return;
    const next = new Date(selected);
    next.setHours(hours24, minutes, 0, 0);
    onChange(format(next, DATE_TIME_FORMAT));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          data-empty={!selected}
          className="h-9 w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          <CalendarIcon className="size-4" />
          {selected ? (
            format(selected, withTime ? "PPP p" : "PPP")
          ) : (
            <span>{placeholder}</span>
          )}
          {selected && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear date"
              className="ml-auto rounded-sm p-0.5 hover:bg-muted"
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
              }}
            >
              <XIcon className="size-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          disabled={disabled}
          onSelect={handleDateSelect}
        />
        {withTime && (
          <div className="border-t border-border p-3">
            <TimePicker12 date={selected} onChange={handleTimeChange} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
