import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";
import type { FormikHelpers } from "formik";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { useStoreContext } from "@/features/admin/store-dashboard/hooks/useStoreContext";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { DiscountForm } from "../components/DiscountForm";
import { CreateDiscountGuide } from "../components/DiscountSidePanels";
import { discountService } from "../services/promo.service";
import type { DiscountFormValues } from "../types/promo.types";
import { EMPTY_DISCOUNT_VALUES, buildDiscountPayload } from "../utils/discountForm";

const LIST_PATH = "/admin/store/discounts";

export function CreateDiscountPage() {
  usePageTitle("Create discount");
  const navigate = useNavigate();
  const { storeId, isReady } = useStoreContext();
  const isSuperAdmin = useAdminSessionStore((s) => s.user)?.role === "superAdmin";

  async function handleSubmit(values: DiscountFormValues, helpers: FormikHelpers<DiscountFormValues>) {
    try {
      await discountService.create(buildDiscountPayload(values, isSuperAdmin ? storeId : null));
      toast.success("Discount created");
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
            <h1 className="text-2xl font-semibold">Create Discount</h1>
            <p className="text-sm text-muted-foreground">Add a product discount for this store.</p>
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
              <p className="text-sm text-muted-foreground">
                Set the type, value, validity period, and quota for this discount.
              </p>
            </div>
            {isReady ? (
              <DiscountForm
                initialValues={EMPTY_DISCOUNT_VALUES}
                initialProduct={null}
                storeId={storeId}
                isEdit={false}
                onSubmit={handleSubmit}
                onCancel={() => navigate(LIST_PATH)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
          </section>
          <CreateDiscountGuide />
        </div>
      </div>
    </AdminDashboardShell>
  );
}
