import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { type FormikHelpers } from "formik";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/dashboard/components/AdminDashboardShell";
import { StoreForm } from "../components/StoreForm";
import { adminStoreService } from "../services/adminStore.service";
import type { AdminStore, StoreFormValues } from "../types/adminStore.types";
import { emptyStoreValues, toStoreFormValues, toStorePayload } from "../utils/storeForm";

export function EditStorePage() {
  usePageTitle("Edit store");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<AdminStore | null>(null);

  useEffect(() => {
    if (!id) return;
    const storeId = id;
    let isMounted = true;
    async function loadStore() {
      try {
        const response = await adminStoreService.getById(storeId);
        if (isMounted) setStore(response.data.data ?? null);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadStore();
    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleSubmit(values: StoreFormValues, helpers: FormikHelpers<StoreFormValues>) {
    if (!id) return;
    try {
      await adminStoreService.update(id, toStorePayload(values));
      toast.success("Store updated successfully");
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
            <h1 className="text-2xl font-semibold">Edit Store</h1>
            <p className="text-sm text-muted-foreground">{store?.name ?? "Update store location."}</p>
          </div>
          <Button asChild variant="outline" className="w-fit"><Link to="/admin/stores"><ArrowLeftIcon className="size-4" />Stores</Link></Button>
        </div>
        <section className="rounded-lg border border-border bg-background p-5 md:p-6">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading store...</p> : (
            <StoreForm initialValues={store ? toStoreFormValues(store) : emptyStoreValues} submitLabel="Save Changes" onSubmit={handleSubmit} />
          )}
        </section>
      </div>
    </AdminDashboardShell>
  );
}
