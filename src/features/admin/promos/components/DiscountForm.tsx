import { type ReactNode, useState } from "react";
import { Formik, Form, type FormikHelpers } from "formik";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { discountSchema } from "../schemas/discount.schemas";
import type { DiscountFormValues, DiscountType } from "../types/promo.types";
import { DiscountDateRange } from "./DiscountDateRange";
import { StockSearchInput, type StockProductOption } from "./StockSearchInput";

const SELECT_CLASS =
  "border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface Props {
  initialValues: DiscountFormValues;
  initialProduct: StockProductOption | null;
  storeId: string;
  isEdit: boolean;
  onSubmit: (values: DiscountFormValues, helpers: FormikHelpers<DiscountFormValues>) => void | Promise<void>;
  onCancel: () => void;
}

export function DiscountForm({ initialValues, initialProduct, storeId, isEdit, onSubmit, onCancel }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<StockProductOption | null>(initialProduct);

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={discountSchema}
      validateOnBlur
      onSubmit={onSubmit}
    >
      {(formik) => {
        const { values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting } = formik;
        const type = values.type as DiscountType | "";

        function handleTypeChange(newType: string) {
          setFieldValue("type", newType);
          setFieldValue("value", "");
          setFieldValue("buyQuantity", "");
          setFieldValue("getQuantity", "");
        }

        return (
          <Form className="grid gap-4">
            <FieldRow label="Name" error={touched.name ? errors.name : undefined}>
              <Input name="name" placeholder="e.g. Milk Payday Promo" value={values.name} onChange={handleChange} onBlur={handleBlur} />
            </FieldRow>

            <FieldRow label="Type" error={touched.type ? errors.type : undefined}>
              <select className={SELECT_CLASS} value={values.type} onChange={(ev) => handleTypeChange(ev.target.value)} onBlur={handleBlur} name="type">
                <option value="">Select type</option>
                <option value="percentage">Percentage (%)</option>
                <option value="nominal">Nominal (IDR)</option>
                <option value="buyXGetY">Buy X Get Y</option>
              </select>
            </FieldRow>

            {(type === "percentage" || type === "nominal") && (
              <FieldRow label={type === "percentage" ? "Value (%)" : "Value (IDR)"} error={touched.value ? (errors.value as string) : undefined}>
                <Input name="value" type="number" min={1} max={type === "percentage" ? 100 : undefined} value={values.value} onChange={handleChange} onBlur={handleBlur} />
              </FieldRow>
            )}

            {type === "buyXGetY" && (
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Buy quantity" error={touched.buyQuantity ? (errors.buyQuantity as string) : undefined}>
                  <Input name="buyQuantity" type="number" min={1} value={values.buyQuantity} onChange={handleChange} onBlur={handleBlur} />
                </FieldRow>
                <FieldRow label="Get quantity" error={touched.getQuantity ? (errors.getQuantity as string) : undefined}>
                  <Input name="getQuantity" type="number" min={1} value={values.getQuantity} onChange={handleChange} onBlur={handleBlur} />
                </FieldRow>
              </div>
            )}

            <FieldRow label="Quota (optional)" error={touched.quota ? (errors.quota as string) : undefined}>
              <Input name="quota" type="number" min={1} placeholder="Leave empty for unlimited" value={values.quota} onChange={handleChange} onBlur={handleBlur} />
            </FieldRow>

            <FieldRow label="Product" error={touched.productId ? errors.productId : undefined}>
              <StockSearchInput
                storeId={storeId}
                selected={selectedProduct}
                onSelect={(p) => { setSelectedProduct(p); setFieldValue("productId", p.productId); }}
                onClear={() => { setSelectedProduct(null); setFieldValue("productId", ""); }}
              />
            </FieldRow>

            <DiscountDateRange formik={formik} />

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
                {isEdit ? "Save Changes" : "Create Discount"}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}

function FieldRow({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
