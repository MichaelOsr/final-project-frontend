import { Form, Formik, useField, type FormikHelpers } from "formik";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePickerField } from "@/features/admin/shared/components/DatePickerField";
import type { StoreOption } from "@/features/admin/shared/types/admin.types";
import { voucherSchema } from "../schemas/voucher.schemas";
import type { VoucherFormValues } from "../types/voucher.types";
import { isOutsideRange } from "../utils/dateTime";
import { VoucherSelectField } from "./VoucherSelectField";

interface Props {
  initialValues: VoucherFormValues;
  isSuperAdmin: boolean;
  isEdit: boolean;
  onSubmit: (values: VoucherFormValues, helpers: FormikHelpers<VoucherFormValues>) => void | Promise<void>;
  onCancel: () => void;
  // When provided (super admin cross-store area), render a store scope dropdown
  // instead of the store-context "Apply globally" checkbox.
  stores?: StoreOption[];
}

export function VoucherForm({ initialValues, isSuperAdmin, isEdit, onSubmit, onCancel, stores }: Props) {
  return (
    <Formik enableReinitialize initialValues={initialValues} validationSchema={voucherSchema} onSubmit={onSubmit}>
      {({ values, isSubmitting }) => {
        const isPercentage = values.discountType === "percentage";
        return (
          <Form className="grid gap-5">
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <TextField name="name" label="Name" placeholder="e.g. Welcome Discount" />
              <TextField name="code" label="Code" placeholder="e.g. WELCOME10" className="uppercase" />
            </div>

            <div className="grid items-start gap-4 sm:grid-cols-2">
              <VoucherSelectField name="voucherType" label="Voucher for">
                <option value="">Select type</option>
                <option value="transaction">Transaction</option>
                <option value="delivery">Delivery</option>
              </VoucherSelectField>
              <VoucherSelectField name="discountType" label="Discount type">
                <option value="">Select type</option>
                <option value="percentage">Percentage (%)</option>
                <option value="nominal">Nominal (IDR)</option>
              </VoucherSelectField>
            </div>

            <div className="grid items-start gap-4 sm:grid-cols-2">
              <TextField
                name="value"
                label={isPercentage ? "Value (%)" : "Value (IDR)"}
                type="number"
                min={1}
                max={isPercentage ? 100 : undefined}
              />
              <TextField name="quantity" label="Quantity" type="number" min={0} placeholder="0" />
            </div>

            <div className="grid items-start gap-4 sm:grid-cols-2">
              <TextField
                name="minimumTransaction"
                label="Min. transaction (optional)"
                type="number"
                min={0}
                placeholder="No minimum"
              />
              {isPercentage ? (
                <TextField
                  name="maxDiscount"
                  label="Max. discount (optional)"
                  type="number"
                  min={0}
                  placeholder="No cap"
                />
              ) : null}
            </div>

            <div className="grid items-start gap-4 sm:grid-cols-2">
              <VoucherDateField name="startDate" label="Start date & time" maxDate={values.endDate} />
              <VoucherDateField name="endDate" label="End date & time" minDate={values.startDate} />
            </div>

            {stores ? <StoreScopeField stores={stores} /> : isSuperAdmin ? <GlobalScopeField /> : null}

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                The code is normalized to uppercase and must be unique.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
                  {isEdit ? "Save Changes" : "Create Voucher"}
                </Button>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}

function VoucherDateField(
  { name, label, minDate, maxDate }: { name: string; label: string; minDate?: string; maxDate?: string },
) {
  const [field, meta, helpers] = useField<string>(name);
  const error = meta.touched ? meta.error : undefined;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <DatePickerField
        value={field.value}
        withTime
        onChange={(v) => {
          helpers.setValue(v);
          helpers.setTouched(true);
        }}
        disabled={(d) => isOutsideRange(d, minDate, maxDate)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function StoreScopeField({ stores }: { stores: StoreOption[] }) {
  return (
    <VoucherSelectField name="storeId" label="Store scope">
      <option value="">Global / All Stores</option>
      {stores.map((store) => (
        <option key={store.id} value={store.id}>
          {store.name}
        </option>
      ))}
    </VoucherSelectField>
  );
}

function GlobalScopeField() {
  const [field] = useField({ name: "isGlobal", type: "checkbox" });
  return (
    <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" {...field} className="size-4 rounded" />
      <span>Apply globally (not store-specific)</span>
    </label>
  );
}
