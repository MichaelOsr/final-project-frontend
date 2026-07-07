import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";
import type { FormikHelpers } from "formik";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { adminOptionsService } from "@/features/admin/shared/services/adminOptions.service";
import type { StoreOption } from "@/features/admin/shared/types/admin.types";
import { VoucherForm } from "../components/VoucherForm";
import { EditVoucherSummary } from "../components/VoucherSidePanels";
import { DeleteVoucherDialog } from "../components/DeleteVoucherDialog";
import { voucherService } from "../services/promo.service";
import type { Voucher, VoucherFormValues } from "../types/voucher.types";
import { buildSuperVoucherPayload, toVoucherFormValues } from "../utils/voucherForm";

const LIST_PATH = "/admin/vouchers";

// Super admin cross-store edit: scope can move between global and any store.
export function SuperEditVoucherPage() {
  usePageTitle("Edit voucher");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    adminOptionsService
      .listStores()
      .then((res) => setStores(res.data.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    async function load(voucherId: string) {
      try {
        const res = await voucherService.get(voucherId);
        if (mounted) setVoucher(res.data.data ?? null);
      } catch (error) {
        if (mounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load(id);
    return () => { mounted = false; };
  }, [id]);

  // Ensure the voucher's own store is always selectable, even if it's not
  // returned by /stores/options (e.g. archived store) — avoids the scope
  // dropdown silently rendering as "Global".
  const storeOptions =
    voucher?.store && !stores.some((s) => s.id === voucher.store!.id)
      ? [voucher.store, ...stores]
      : stores;

  async function handleSubmit(values: VoucherFormValues, helpers: FormikHelpers<VoucherFormValues>) {
    if (!id) return;
    try {
      await voucherService.update(id, buildSuperVoucherPayload(values));
      toast.success("Voucher updated");
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
            <h1 className="text-2xl font-semibold">Edit Voucher</h1>
            <p className="text-sm text-muted-foreground">{voucher?.code ?? "Update voucher details."}</p>
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
              <p className="text-sm text-muted-foreground">Update the discount, period, quota, or store scope.</p>
            </div>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading voucher...</p>
            ) : voucher ? (
              <VoucherForm
                initialValues={toVoucherFormValues(voucher)}
                isSuperAdmin
                isEdit
                stores={storeOptions}
                onSubmit={handleSubmit}
                onCancel={() => navigate(LIST_PATH)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Voucher not found.</p>
            )}
          </section>
          <EditVoucherSummary voucher={voucher} onDelete={() => setDeleteOpen(true)} />
        </div>
      </div>
      <DeleteVoucherDialog
        open={deleteOpen}
        voucher={voucher}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate(LIST_PATH)}
      />
    </AdminDashboardShell>
  );
}
