import { Form, Formik, useFormikContext, type FormikHelpers } from "formik";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LocationPicker } from "@/features/address/components/LocationPicker";
import { storeSchema } from "../schemas/adminStore.schemas";
import type { StoreFormValues } from "../types/adminStore.types";

interface StoreFormDialogProps {
  initialValues: StoreFormValues;
  isEdit: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    values: StoreFormValues,
    helpers: FormikHelpers<StoreFormValues>,
  ) => Promise<void>;
}

export function StoreFormDialog(props: StoreFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {props.isEdit ? "Edit store" : "Create store"}
          </DialogTitle>
          <DialogDescription>
            {props.isEdit
              ? "Update the store name and location."
              : "Add a new store with a name and map location."}
          </DialogDescription>
        </DialogHeader>
        <Formik
          enableReinitialize
          initialValues={props.initialValues}
          validationSchema={storeSchema}
          onSubmit={props.onSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="grid gap-5">
              <TextField name="name" label="Name" placeholder="GrocerGo Surabaya" />
              <LocationPickerField />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => props.onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <SaveIcon className="size-4" />
                  )}
                  {props.isEdit ? "Save Changes" : "Create Store"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

function LocationPickerField() {
  const { values, setFieldValue, touched, errors } =
    useFormikContext<StoreFormValues>();

  return (
    <div className="grid gap-1.5">
      <Label>Location</Label>
      <LocationPicker
        value={{ lat: values.latitude, lng: values.longitude }}
        onChange={(lat, lng) => {
          void setFieldValue("latitude", lat);
          void setFieldValue("longitude", lng);
        }}
      />
      {touched.latitude && errors.latitude ? (
        <p className="text-xs text-destructive">{errors.latitude}</p>
      ) : null}
      {touched.longitude && errors.longitude ? (
        <p className="text-xs text-destructive">{errors.longitude}</p>
      ) : null}
    </div>
  );
}
