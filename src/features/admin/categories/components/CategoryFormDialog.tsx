import { Form, Formik, type FormikHelpers } from "formik";
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
import { categorySchema } from "../schemas/adminCategory.schemas";
import type { CategoryFormValues } from "../types/adminCategory.types";

interface CategoryFormDialogProps {
  initialValues: CategoryFormValues;
  isEdit: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues, helpers: FormikHelpers<CategoryFormValues>) => Promise<void>;
}

export function CategoryFormDialog(props: CategoryFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.isEdit ? "Edit category" : "Create category"}</DialogTitle>
          <DialogDescription>
            {props.isEdit ? "Update the category name used by related products." : "Add a category for product forms and filters."}
          </DialogDescription>
        </DialogHeader>
        <Formik enableReinitialize initialValues={props.initialValues} validationSchema={categorySchema} onSubmit={props.onSubmit}>
          {({ isSubmitting }) => (
            <Form className="grid gap-5">
              <TextField name="name" label="Name" placeholder="Frozen Food" />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
                  {props.isEdit ? "Save Changes" : "Create Category"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
