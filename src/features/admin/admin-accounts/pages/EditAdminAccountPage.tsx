import { useEffect, useMemo, useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/dashboard/components/AdminDashboardShell";
import type { AdminUserOverview, StoreOverview } from "@/features/admin/dashboard/types/adminDashboard.types";
import { AdminAccountSelectField } from "../components/AdminAccountSelectField";
import { EditAccountSummary } from "../components/AdminAccountSidePanels";
import { DeleteAdminAccountDialog } from "../components/DeleteAdminAccountDialog";
import { editAdminAccountSchema } from "../schemas/adminAccount.schemas";
import { adminAccountService } from "../services/adminAccount.service";
import type { AdminRoleOption, EditAdminAccountFormValues } from "../types/adminAccount.types";
import { formatRoleName, resolveAdminRoles } from "../utils/adminAccountFormat";

const emptyValues: EditAdminAccountFormValues = { name: "", password: "", roleName: "", storeId: "" };

export function EditAdminAccountPage() {
  usePageTitle("Edit admin account");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<AdminUserOverview | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<AdminRoleOption[]>([]);
  const [stores, setStores] = useState<StoreOverview[]>([]);
  const roleByName = useMemo(() => new Map(roles.map((role) => [role.name, role])), [roles]);

  useEffect(() => {
    if (!id) return;
    const accountId = id;
    let isMounted = true;
    async function loadEditData() {
      try {
        const [accountResponse, rolesResponse, storesResponse] = await Promise.all([
          adminAccountService.getById(accountId),
          adminAccountService.listRoles(),
          adminAccountService.listStores(),
        ]);
        if (!isMounted) return;
        setAccount(accountResponse.data.data ?? null);
        setRoles(resolveAdminRoles(rolesResponse.data.data ?? []));
        setStores(storesResponse.data.data ?? []);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadEditData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const initialValues = account ? toFormValues(account) : emptyValues;

  async function handleSubmit(
    values: EditAdminAccountFormValues,
    helpers: FormikHelpers<EditAdminAccountFormValues>,
  ) {
    if (!id) return;
    const role = values.roleName ? roleByName.get(values.roleName) : undefined;
    if (!role) {
      toast.error("Role was not found");
      helpers.setSubmitting(false);
      return;
    }
    try {
      await adminAccountService.update(id, {
        name: values.name.trim(),
        roleId: role.id,
        ...(values.password ? { password: values.password } : {}),
        storeId: values.roleName === "storeAdmin" ? values.storeId : null,
      });
      toast.success("Admin account updated successfully");
      navigate("/admin/admin-accounts");
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      helpers.setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!id) return;
    setIsDeleting(true);
    try {
      await adminAccountService.delete(id);
      toast.success("Admin account deleted successfully");
      navigate("/admin/admin-accounts");
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AdminDashboardShell>
      <div className="mx-auto grid w-full max-w-5xl gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Edit Admin Account</h1>
            <p className="text-sm text-muted-foreground">{account?.email ?? "Update account access."}</p>
          </div>
          <Button asChild variant="outline" className="w-fit"><Link to="/admin/admin-accounts"><ArrowLeftIcon className="size-4" />Admin Accounts</Link></Button>
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="rounded-lg border border-border bg-background p-5 md:p-6">
            <div className="mb-6 grid gap-1">
              <h2 className="text-lg font-semibold">Account details</h2>
              <p className="text-sm text-muted-foreground">
                Update profile access without changing the admin email.
              </p>
            </div>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading account...</p>
            ) : (
              <EditAdminAccountForm
                initialValues={initialValues}
                roles={roles}
                stores={stores}
                onSubmit={handleSubmit}
              />
            )}
          </section>
          <EditAccountSummary account={account} onDelete={() => setDeleteOpen(true)} />
        </div>
      </div>
      <DeleteAdminAccountDialog
        accountName={account?.name ?? ""}
        isDeleting={isDeleting}
        open={deleteOpen}
        onConfirm={confirmDelete}
        onOpenChange={setDeleteOpen}
      />
    </AdminDashboardShell>
  );
}

function EditAdminAccountForm({ initialValues, roles, stores, onSubmit }: {
  initialValues: EditAdminAccountFormValues;
  roles: AdminRoleOption[];
  stores: StoreOverview[];
  onSubmit: (
    values: EditAdminAccountFormValues,
    helpers: FormikHelpers<EditAdminAccountFormValues>,
  ) => Promise<void>;
}) {
  return (
    <Formik enableReinitialize initialValues={initialValues} validationSchema={editAdminAccountSchema} onSubmit={onSubmit}>
      {({ isSubmitting, values }) => (
        <Form className="grid gap-5">
          <TextField name="name" label="Name" placeholder="Store Admin A" />
          <TextField name="password" label="New password" type="password" autoComplete="new-password" />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminAccountSelectField name="roleName" label="Role">
              <option value="">Select role</option>
              {roles.map((role) => <option key={role.id} value={role.name}>{formatRoleName(role.name)}</option>)}
            </AdminAccountSelectField>
            {values.roleName === "storeAdmin" ? (
              <AdminAccountSelectField name="storeId" label="Store">
                <option value="">Select store</option>
                {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
              </AdminAccountSelectField>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Leave password empty if it should stay unchanged.
            </p>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              Save Changes
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

function toFormValues(account: AdminUserOverview): EditAdminAccountFormValues {
  const roleName = account.role?.name === "storeAdmin" ? "storeAdmin" : "superAdmin";
  return {
    name: account.name,
    password: "",
    roleName,
    storeId: account.store?.id ?? "",
  };
}
