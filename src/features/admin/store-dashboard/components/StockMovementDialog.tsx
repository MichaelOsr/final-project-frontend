import { Form, Formik, useField, useFormikContext, type FormikHelpers } from "formik";
import { SaveIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { TextField } from "@/components/form/TextField";
import { TextareaField } from "@/components/form/TextareaField";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { stockMovementSchema } from "../schemas/stockMovement.schemas";
import { STOCK_MOVEMENT_TYPE_GROUPS, previewStockAfter } from "../utils/stockMovement";
import type { CreateMovementPayload } from "../types/stockMovement.types";

const SELECT_CLASS =
  "border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface StockMovementDialogProps {
  open: boolean;
  productName: string;
  currentStock: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateMovementPayload, helpers: FormikHelpers<CreateMovementPayload>) => Promise<void>;
}

const initialValues: CreateMovementPayload = { type: "purchase", quantity: 1, notes: "" };

function MovementTypeField() {
  const [field, meta] = useField("type");
  const error = meta.touched ? meta.error : undefined;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor="movement-type">Movement type</Label>
      <select id="movement-type" className={SELECT_CLASS} {...field} aria-invalid={Boolean(error)}>
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
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function MovementPreview({ currentStock }: { currentStock: number }) {
  const { values } = useFormikContext<CreateMovementPayload>();
  const quantity = Number(values.quantity) || 0;
  const nextStock = previewStockAfter(currentStock, values.type, quantity);
  const isNegative = nextStock < 0;

  return (
    <div className="grid gap-2 rounded-lg bg-muted/50 p-3 sm:grid-cols-2">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Current Stock</p>
        <p className="text-lg font-semibold">{currentStock}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">New Stock</p>
        <p className={`text-lg font-semibold ${isNegative ? "text-destructive" : ""}`}>{nextStock}</p>
        {isNegative && <p className="text-xs text-destructive">Resulting stock cannot be negative</p>}
      </div>
    </div>
  );
}

function SubmitButton({ currentStock, isSubmitting }: { currentStock: number; isSubmitting: boolean }) {
  const { values } = useFormikContext<CreateMovementPayload>();
  const quantity = Number(values.quantity) || 0;
  const isNegative = previewStockAfter(currentStock, values.type, quantity) < 0;
  return (
    <Button type="submit" disabled={isSubmitting || isNegative}>
      {isSubmitting ? <Spinner /> : <SaveIcon className="size-4" />}
      Save
    </Button>
  );
}

export function StockMovementDialog(props: StockMovementDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            Record a stock movement for {props.productName || "this product"}. This will create a history entry and update the stock.
          </DialogDescription>
        </DialogHeader>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={stockMovementSchema}
          onSubmit={props.onSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="grid gap-5">
              <MovementTypeField />
              <TextField name="quantity" label="Quantity" type="number" min={1} placeholder="1" />
              <TextareaField name="notes" label="Notes (optional)" placeholder="e.g. Restock from supplier" rows={3} />
              <MovementPreview currentStock={props.currentStock} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <SubmitButton currentStock={props.currentStock} isSubmitting={isSubmitting} />
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
