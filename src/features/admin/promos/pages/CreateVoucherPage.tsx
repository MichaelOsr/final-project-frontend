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
import { VoucherForm } from "../components/VoucherForm";
import { CreateVoucherGuide } from "../components/VoucherSidePanels";
import { voucherService } from "../services/promo.service";
import type { VoucherFormValues } from "../types/voucher.types";
import { EMPTY_VOUCHER_VALUES, buildVoucherPayload } from "../utils/voucherForm";

const LIST_PATH = "/admin/store/vouchers";

export function CreateVoucherPage() {
  usePageTitle("Create voucher");
  const navigate = useNavigate();
  const { storeId, isReady } = useStoreContext();
  const isSuperAdmin = useAdminSessionStore((s) => s.user)?.role === "superAdmin";

  async function handleSubmit(values: VoucherFormValues, helpers: FormikHelpers<VoucherFormValues>) {
    try {
      await voucherService.create(buildVoucherPayload(values, storeId, isSuperAdmin));
      toast.success("Voucher created");
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
            <h1 className="text-2xl font-semibold">Create Voucher</h1>
            <p className="text-sm text-muted-foreground">Add a transaction or delivery voucher.</p>
          </div>
          <Button asChild variant="outline" className="w-fit">
            <Link to={LIST_PATH}>
              <ArrowLeftIcon className="size-4" />
              Vouchers
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="rounded-lg border border-border bg-background p-5 md:p-6">
            <div className="mb-6 grid gap-1">
              <h2 className="text-lg font-semibold">Voucher details</h2>
              <p className="text-sm text-muted-foreground">
                Set the discount, validity period, and quota for this voucher.
              </p>
            </div>
            {isReady ? (
              <VoucherForm
                initialValues={EMPTY_VOUCHER_VALUES}
                isSuperAdmin={isSuperAdmin}
                isEdit={false}
                onSubmit={handleSubmit}
                onCancel={() => navigate(LIST_PATH)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
          </section>
          <CreateVoucherGuide isSuperAdmin={isSuperAdmin} />
        </div>
      </div>
    </AdminDashboardShell>
  );
}
