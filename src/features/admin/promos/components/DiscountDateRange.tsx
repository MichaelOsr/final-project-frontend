import type { FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { DatePickerField } from "@/features/admin/shared/components/DatePickerField";
import type { DiscountFormValues } from "../types/promo.types";
import { isOutsideRange } from "../utils/dateTime";

export function DiscountDateRange({ formik }: { formik: FormikProps<DiscountFormValues> }) {
  const { values, touched, errors } = formik;

  function update(field: "startDate" | "endDate", value: string) {
    formik.setFieldValue(field, value);
    formik.setFieldTouched(field, true, false);
  }

  return (
    <div className="grid grid-cols-2 items-start gap-3">
      <DateField
        label="Start date & time"
        value={values.startDate}
        error={touched.startDate ? errors.startDate : undefined}
        onChange={(v) => update("startDate", v)}
        disabled={(d) => isOutsideRange(d, undefined, values.endDate)}
      />
      <DateField
        label="End date & time"
        value={values.endDate}
        error={touched.endDate ? errors.endDate : undefined}
        onChange={(v) => update("endDate", v)}
        disabled={(d) => isOutsideRange(d, values.startDate, undefined)}
      />
    </div>
  );
}

interface DateFieldProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  disabled: (date: Date) => boolean;
}

function DateField({ label, value, error, onChange, disabled }: DateFieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <DatePickerField value={value} withTime onChange={onChange} disabled={disabled} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
