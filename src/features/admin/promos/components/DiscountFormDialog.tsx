import { type ReactNode, useState } from "react";
import { useFormik } from "formik";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { discountSchema } from "../schemas/discount.schemas";
import { discountService } from "../services/promo.service";
import type { Discount, DiscountFormValues, DiscountType } from "../types/promo.types";
import { toIso, toLocalDateTime } from "../utils/dateTime";
import { DiscountDateRange } from "./DiscountDateRange";
import { StockSearchInput, type StockProductOption } from "./StockSearchInput";

const SELECT_CLASS =
  "border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface Props {
  open: boolean;
  discount: Discount | null;
  storeId: string;
  isSuperAdmin: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (discount: Discount) => void;
}

function toInitialValues(discount: Discount | null): DiscountFormValues {
  if (!discount) {
    return { name: "", type: "", value: "", buyQuantity: "", getQuantity: "", quota: "", productId: "", startDate: "", endDate: "" };
  }
  return {
    name: discount.name,
    type: discount.type,
    value: discount.value ?? "",
    buyQuantity: discount.buyQuantity ?? "",
    getQuantity: discount.getQuantity ?? "",
    quota: discount.quota ?? "",
    productId: discount.productId,
    startDate: toLocalDateTime(discount.startDate),
    endDate: toLocalDateTime(discount.endDate),
  };
}

function buildPayload(values: DiscountFormValues, storeId: string | null) {
  const base = {
    name: values.name.trim(),
    type: values.type as DiscountType,
    productId: values.productId,
    startDate: toIso(values.startDate),
    endDate: toIso(values.endDate),
    ...(storeId ? { storeId } : {}),
    ...(values.quota !== "" ? { quota: Number(values.quota) } : {}),
  };
  if (values.type === "buyXGetY") {
    return { ...base, buyQuantity: Number(values.buyQuantity), getQuantity: Number(values.getQuantity) };
  }
  return { ...base, value: Number(values.value) };
}

export function DiscountFormDialog({ open, discount, storeId, isSuperAdmin, onOpenChange, onSaved }: Props) {
  const isEdit = Boolean(discount);
  const [selectedProduct, setSelectedProduct] = useState<StockProductOption | null>(null);

  // Sync product display to the target discount on (re)open via render-time reset (no effect).
  const [syncKey, setSyncKey] = useState<string>("closed");
  const targetKey = open ? discount?.id ?? "new" : "closed";
  if (syncKey !== targetKey) {
    setSyncKey(targetKey);
    setSelectedProduct(
      open && discount
        ? { productId: discount.productId, name: discount.product.name, sku: discount.product.sku }
        : null,
    );
  }

  const formik = useFormik<DiscountFormValues>({
    initialValues: toInitialValues(discount),
    enableReinitialize: true,
    validationSchema: discountSchema,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      try {
        const createStoreId = isSuperAdmin ? storeId : null;
        const res = isEdit
          ? await discountService.update(discount!.id, buildPayload(values, null))
          : await discountService.create(buildPayload(values, createStoreId));
        toast.success(isEdit ? "Discount updated" : "Discount created");
        onSaved(res.data.data!);
        handleClose();
      } catch (error) {
        toast.error(getAdminErrorMessage(error));
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  function handleClose() {
    formik.resetForm();
    setSelectedProduct(null);
    onOpenChange(false);
  }

  function handleTypeChange(newType: string) {
    formik.setFieldValue("type", newType);
    formik.setFieldValue("value", "");
    formik.setFieldValue("buyQuantity", "");
    formik.setFieldValue("getQuantity", "");
  }

  const t = formik.touched;
  const e = formik.errors;
  const type = formik.values.type as DiscountType | "";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit discount" : "Create discount"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update discount details." : "Add a product discount for this store."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="grid gap-4">
          <FieldRow label="Name" error={t.name ? e.name : undefined}>
            <Input name="name" placeholder="e.g. Milk Payday Promo" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          </FieldRow>

          <FieldRow label="Type" error={t.type ? e.type : undefined}>
            <select className={SELECT_CLASS} value={formik.values.type} onChange={(ev) => handleTypeChange(ev.target.value)} onBlur={formik.handleBlur} name="type">
              <option value="">Select type</option>
              <option value="percentage">Percentage (%)</option>
              <option value="nominal">Nominal (IDR)</option>
              <option value="buyXGetY">Buy X Get Y</option>
            </select>
          </FieldRow>

          {(type === "percentage" || type === "nominal") && (
            <FieldRow label={type === "percentage" ? "Value (%)" : "Value (IDR)"} error={t.value ? (e.value as string) : undefined}>
              <Input name="value" type="number" min={1} max={type === "percentage" ? 100 : undefined} value={formik.values.value} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </FieldRow>
          )}

          {type === "buyXGetY" && (
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Buy quantity" error={t.buyQuantity ? (e.buyQuantity as string) : undefined}>
                <Input name="buyQuantity" type="number" min={1} value={formik.values.buyQuantity} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              </FieldRow>
              <FieldRow label="Get quantity" error={t.getQuantity ? (e.getQuantity as string) : undefined}>
                <Input name="getQuantity" type="number" min={1} value={formik.values.getQuantity} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              </FieldRow>
            </div>
          )}

          <FieldRow label="Quota (optional)" error={t.quota ? (e.quota as string) : undefined}>
            <Input name="quota" type="number" min={1} placeholder="Leave empty for unlimited" value={formik.values.quota} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          </FieldRow>

          <FieldRow label="Product" error={t.productId ? e.productId : undefined}>
            <StockSearchInput
              storeId={storeId}
              selected={selectedProduct}
              onSelect={(p) => { setSelectedProduct(p); formik.setFieldValue("productId", p.productId); }}
              onClear={() => { setSelectedProduct(null); formik.setFieldValue("productId", ""); }}
            />
          </FieldRow>

          <DiscountDateRange formik={formik} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={formik.isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              {isEdit ? "Save changes" : "Create discount"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
