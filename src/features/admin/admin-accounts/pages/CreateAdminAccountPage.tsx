import { useEffect, useMemo, useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  KeyRoundIcon,
  Loader2Icon,
  SaveIcon,
} from "lucide-react";
import { toast } from "sonner";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import type { StoreOption } from "@/features/admin/shared/types/admin.types";
import { adminOptionsService } from "@/features/admin/shared/services/adminOptions.service";
import { AdminAccountSelectField } from "../components/AdminAccountSelectField";
import { CreateAccountGuide } from "../components/AdminAccountSidePanels";
import { createAdminAccountSchema } from "../schemas/adminAccount.schemas";
import { adminAccountService } from "../services/adminAccount.service";
import type { AdminRoleOption, CreateAdminAccountFormValues } from "../types/adminAccount.types";
import { formatRoleName } from "@/features/admin/shared/utils/adminFormat";
import { resolveAdminRoles } from "../utils/adminAccountFormat";

const initialValues: CreateAdminAccountFormValues = { name: "", email: "", password: "", roleName: "", storeId: "" };

const passwordRules = ["At least 8 characters", "One uppercase letter", "One number"];

export function CreateAdminAccountPage() {
  usePageTitle("Create admin account");
  const navigate = useNavigate();
  const [roles, setRoles] = useState<AdminRoleOption[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadOptions() {
      try {
        const [rolesResponse, storesResponse] = await Promise.all([
          adminOptionsService.listRoles(),
          adminOptionsService.listStores(),
        ]);

        if (!isMounted) return;

        setRoles(resolveAdminRoles(rolesResponse.data.data ?? []));
        setStores(storesResponse.data.data ?? []);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const roleByName = useMemo(() => new Map(roles.map((role) => [role.name, role])), [roles]);

  async function handleSubmit(
    values: CreateAdminAccountFormValues,
    helpers: FormikHelpers<CreateAdminAccountFormValues>,
  ) {
    const role = values.roleName ? roleByName.get(values.roleName) : undefined;
    if (!role) {
      toast.error("Role was not found");
      helpers.setSubmitting(false);
      return;
    }

    try {
      await adminAccountService.create({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        roleId: role.id,
        ...(values.roleName === "storeAdmin" ? { storeId: values.storeId } : {}),
      });
      toast.success("Admin account created successfully");
      navigate("/admin/dashboard");
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
            <h1 className="text-2xl font-semibold">Create Admin Account</h1>
            <p className="text-sm text-muted-foreground">
              Add a super admin or store admin with the correct access.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit">
            <Link to="/admin/dashboard">
              <ArrowLeftIcon className="size-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="rounded-lg border border-border bg-background p-5 md:p-6">
          <div className="mb-6 grid gap-1">
            <h2 className="text-lg font-semibold">Account details</h2>
            <p className="text-sm text-muted-foreground">
              Use a unique email and assign store access only when the role requires it.
            </p>
          </div>
          <CreateAdminAccountForm
            isLoading={isLoading}
            roles={roles}
            stores={stores}
            onSubmit={handleSubmit}
          />
          </section>
          <CreateAccountGuide storesCount={stores.length} rolesCount={roles.length} />
        </div>
      </div>
    </AdminDashboardShell>
  );
}

function CreateAdminAccountForm({
  isLoading,
  roles,
  stores,
  onSubmit,
}: {
  isLoading: boolean;
  roles: AdminRoleOption[];
  stores: StoreOption[];
  onSubmit: (
    values: CreateAdminAccountFormValues,
    helpers: FormikHelpers<CreateAdminAccountFormValues>,
  ) => Promise<void>;
}) {
  return (
    <Formik initialValues={initialValues} validationSchema={createAdminAccountSchema} onSubmit={onSubmit}>
      {({ isSubmitting, values }) => (
        <Form className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="name" label="Name" placeholder="Store Admin A" autoComplete="name" />
            <TextField name="email" label="Email" type="email" placeholder="admin@example.com" autoComplete="email" />
          </div>
          <div className="grid gap-4 rounded-lg bg-muted/60 p-4 md:grid-cols-[1fr_14rem]">
            <TextField name="password" label="Password" type="password" autoComplete="new-password" />
            <div className="grid gap-2 text-xs text-muted-foreground">
              {passwordRules.map((rule) => (
                <div key={rule} className="flex items-center gap-2">
                  <KeyRoundIcon className="size-3.5 text-primary" />
                  {rule}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminAccountSelectField name="roleName" label="Role" disabled={isLoading}>
              <option value="">Select role</option>
              {roles.map((role) => <option key={role.name} value={role.name}>{formatRoleName(role.name)}</option>)}
            </AdminAccountSelectField>
            {values.roleName === "storeAdmin" ? (
              <AdminAccountSelectField name="storeId" label="Store" disabled={isLoading}>
                <option value="">Select store</option>
                {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
              </AdminAccountSelectField>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                Super admin accounts are not tied to a single store.
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              The account is created verified and can sign in through the admin portal.
            </p>
            <Button type="submit" className="h-10 px-4" disabled={isLoading || isSubmitting}>
              {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              Create Account
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
