import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { type FormikHelpers } from "formik";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/dashboard/components/AdminDashboardShell";
import { StoreForm } from "../components/StoreForm";
import { adminStoreService } from "../services/adminStore.service";
import type { StoreFormValues } from "../types/adminStore.types";
import { emptyStoreValues, toStorePayload } from "../utils/storeForm";

export function CreateStorePage() {
  usePageTitle("Create store");
  const navigate = useNavigate();

  async function handleSubmit(values: StoreFormValues, helpers: FormikHelpers<StoreFormValues>) {
    try {
      await adminStoreService.create(toStorePayload(values));
      toast.success("Store created successfully");
      navigate("/admin/stores");
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
            <h1 className="text-2xl font-semibold">Create Store</h1>
            <p className="text-sm text-muted-foreground">Add a store location for admin assignment.</p>
          </div>
          <Button asChild variant="outline" className="w-fit">
            <Link to="/admin/stores"><ArrowLeftIcon className="size-4" />Stores</Link>
          </Button>
        </div>
        <section className="rounded-lg border border-border bg-background p-5 md:p-6">
          <StoreForm initialValues={emptyStoreValues} submitLabel="Create Store" onSubmit={handleSubmit} />
        </section>
      </div>
    </AdminDashboardShell>
  );
}
