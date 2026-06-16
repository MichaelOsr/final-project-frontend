import { format, parseISO } from "date-fns";
import { CalendarIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
}

export function DatePickerField({ value, onChange, placeholder = "Pick a date", disabled }: DatePickerFieldProps) {
  const selected = value ? parseISO(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!selected}
          className="h-9 w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          <CalendarIcon className="size-4" />
          {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
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
          onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
        />
      </PopoverContent>
    </Popover>
  );
}
