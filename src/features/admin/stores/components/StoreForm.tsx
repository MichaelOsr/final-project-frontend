import { Form, Formik, type FormikHelpers } from "formik";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/button";
import { storeFormSchema } from "../schemas/adminStore.schemas";
import type { StoreFormValues } from "../types/adminStore.types";

interface StoreFormProps {
  initialValues: StoreFormValues;
  submitLabel: string;
  onSubmit: (values: StoreFormValues, helpers: FormikHelpers<StoreFormValues>) => Promise<void>;
}

export function StoreForm({ initialValues, submitLabel, onSubmit }: StoreFormProps) {
  return (
    <Formik enableReinitialize initialValues={initialValues} validationSchema={storeFormSchema} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="grid gap-5">
          <TextField name="name" label="Store name" placeholder="Main Store" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="latitude" label="Latitude" inputMode="decimal" placeholder="-6.2" />
            <TextField name="longitude" label="Longitude" inputMode="decimal" placeholder="106.8" />
          </div>
          <div className="flex justify-end border-t border-border pt-5">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              {submitLabel}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
