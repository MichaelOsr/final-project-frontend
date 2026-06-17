import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import type { AdminProduct } from "@/features/admin/products/types/adminProduct.types";
import { createTransferSchema } from "../schemas/stockTransfer.schemas";
import { stockTransferService } from "../services/stockTransfer.service";
import type { StockTransferRequest, TransferSource } from "../types/stockTransfer.types";
import { ProductSearchInput } from "./ProductSearchInput";

const SELECT_CLASS =
  "border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface Props {
  open: boolean;
  toStoreId: string;
  product?: AdminProduct;
  onOpenChange: (open: boolean) => void;
  onCreated?: (request: StockTransferRequest) => void;
}

export function CreateTransferDialog({ open, toStoreId, product, onOpenChange, onCreated }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [sources, setSources] = useState<TransferSource[]>([]);
  const [sourcesFor, setSourcesFor] = useState<string | null>(null);
  const activeProduct = product ?? selectedProduct;
  const isLocked = Boolean(product);
  const sourcesReady = activeProduct != null && sourcesFor === activeProduct.id;

  const formik = useFormik({
    initialValues: { productId: product?.id ?? "", fromStoreId: "", quantity: 1, requestNotes: "" },
    validationSchema: createTransferSchema,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      try {
        const res = await stockTransferService.createRequest({
          productId: values.productId,
          fromStoreId: values.fromStoreId,
          toStoreId,
          quantity: values.quantity,
          ...(values.requestNotes ? { requestNotes: values.requestNotes } : {}),
        });
        toast.success("Transfer request created");
        onCreated?.(res.data.data!);
        handleClose();
      } catch (error) {
        toast.error(getAdminErrorMessage(error));
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  async function loadSources(productId: string) {
    try {
      const res = await stockTransferService.getSources(productId, toStoreId);
      setSources(res.data.data ?? []);
      setSourcesFor(productId);
    } catch {
      toast.error("Failed to fetch source stores");
    }
  }

  useEffect(() => {
    if (!open || !product) return;
    const productId = product.id;
    let active = true;
    async function load() {
      try {
        const res = await stockTransferService.getSources(productId, toStoreId);
        if (!active) return;
        setSources(res.data.data ?? []);
        setSourcesFor(productId);
      } catch {
        if (active) toast.error("Failed to fetch source stores");
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [open, product, toStoreId]);

  async function pickProduct(picked: AdminProduct) {
    setSelectedProduct(picked);
    await formik.setFieldValue("productId", picked.id);
    await formik.setFieldValue("fromStoreId", "");
    loadSources(picked.id);
  }

  function clearProduct() {
    setSelectedProduct(null);
    formik.setFieldValue("productId", "");
    formik.setFieldValue("fromStoreId", "");
    setSources([]);
    setSourcesFor(null);
  }

  function handleClose() {
    formik.resetForm();
    setSelectedProduct(null);
    setSources([]);
    setSourcesFor(null);
    onOpenChange(false);
  }

  const err = formik.errors;
  const touched = formik.touched;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Transfer Request</DialogTitle>
          <DialogDescription>Request stock transfer from another store.</DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Product</Label>
            {isLocked && activeProduct ? (
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                <p className="font-medium">{activeProduct.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{activeProduct.sku}</p>
              </div>
            ) : (
              <ProductSearchInput selected={selectedProduct} onSelect={pickProduct} onClear={clearProduct} />
            )}
            {touched.productId && err.productId && <p className="text-xs text-destructive">{err.productId}</p>}
          </div>

          {activeProduct && (
            <div className="grid gap-1.5">
              <Label htmlFor="fromStoreId">Source store</Label>
              <div className="relative">
                <select
                  id="fromStoreId"
                  className={`${SELECT_CLASS} w-full appearance-none pr-9`}
                  value={formik.values.fromStoreId}
                  onChange={(e) => formik.setFieldValue("fromStoreId", e.target.value)}
                  onBlur={formik.handleBlur}
                  disabled={!sourcesReady}
                >
                  {!sourcesReady ? (
                    <option value="">Loading sources...</option>
                  ) : sources.length === 0 ? (
                    <option value="">No stores with stock available</option>
                  ) : (
                    <>
                      <option value="">Select source store</option>
                      {sources.map((s) => (
                        <option key={s.storeId} value={s.storeId}>{s.store.name} (stock: {s.stock})</option>
                      ))}
                    </>
                  )}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {sourcesReady ? <ChevronDownIcon className="size-4" /> : <Spinner />}
                </span>
              </div>
              {touched.fromStoreId && err.fromStoreId && <p className="text-xs text-destructive">{err.fromStoreId}</p>}
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" min={1} value={formik.values.quantity} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {touched.quantity && err.quantity && <p className="text-xs text-destructive">{err.quantity as string}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="requestNotes">Request notes (optional)</Label>
            <Textarea id="requestNotes" placeholder="Reason for this transfer request..." rows={2} value={formik.values.requestNotes} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {touched.requestNotes && err.requestNotes && <p className="text-xs text-destructive">{err.requestNotes}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting && <Spinner />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
