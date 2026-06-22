import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";
import type { FormikHelpers } from "formik";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { useStoreContext } from "@/features/admin/store-dashboard/hooks/useStoreContext";
import { DiscountForm } from "../components/DiscountForm";
import { EditDiscountSummary } from "../components/DiscountSidePanels";
import { DeleteDiscountDialog } from "../components/DeleteDiscountDialog";
import { discountService } from "../services/promo.service";
import type { Discount, DiscountFormValues } from "../types/promo.types";
import { buildDiscountPayload, toDiscountFormValues } from "../utils/discountForm";

const LIST_PATH = "/admin/store/discounts";

export function EditDiscountPage() {
  usePageTitle("Edit discount");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { storeId } = useStoreContext();
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    async function load(discountId: string) {
      try {
        const res = await discountService.get(discountId);
        if (mounted) setDiscount(res.data.data ?? null);
      } catch (error) {
        if (mounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load(id);
    return () => { mounted = false; };
  }, [id]);

  async function handleSubmit(values: DiscountFormValues, helpers: FormikHelpers<DiscountFormValues>) {
    if (!id) return;
    try {
      await discountService.update(id, buildDiscountPayload(values, null));
      toast.success("Discount updated");
      navigate(LIST_PATH);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      helpers.setSubmitting(false);
    }
  }

  return (
    <AdminDashboardShell>
      <div className="mx-auto grid w-full max-w-5xl gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Edit Discount</h1>
            <p className="text-sm text-muted-foreground">{discount?.name ?? "Update discount details."}</p>
          </div>
          <Button asChild variant="outline" className="w-fit">
            <Link to={LIST_PATH}>
              <ArrowLeftIcon className="size-4" />
              Discounts
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="rounded-lg border border-border bg-background p-5 md:p-6">
            <div className="mb-6 grid gap-1">
              <h2 className="text-lg font-semibold">Discount details</h2>
              <p className="text-sm text-muted-foreground">Update the type, value, period, or quota.</p>
            </div>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading discount...</p>
            ) : discount ? (
              <DiscountForm
                initialValues={toDiscountFormValues(discount)}
                initialProduct={{
                  productId: discount.productId,
                  name: discount.product.name,
                  sku: discount.product.sku,
                }}
                storeId={storeId}
                isEdit
                onSubmit={handleSubmit}
                onCancel={() => navigate(LIST_PATH)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Discount not found.</p>
            )}
          </section>
          <EditDiscountSummary discount={discount} onDelete={() => setDeleteOpen(true)} />
        </div>
      </div>
      <DeleteDiscountDialog
        open={deleteOpen}
        discount={discount}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate(LIST_PATH)}
      />
    </AdminDashboardShell>
  );
}
