import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import type { AdminRoleOption, AdminUserOverview, PaginationMeta, StoreOption } from "@/features/admin/shared/types/admin.types";
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import { adminAccountService } from "@/features/admin/admin-accounts/services/adminAccount.service";
import { adminOptionsService } from "@/features/admin/shared/services/adminOptions.service";
import { AccountDetailDialog } from "../components/AccountDetailDialog";
import { AccountFilters, type AccountSortBy } from "../components/AccountFilters";
import { AccountsTable } from "../components/AccountsTable";
import { accountService } from "../services/account.service";
import { DeleteAdminAccountDialog } from "@/features/admin/admin-accounts/components/DeleteAdminAccountDialog";

const defaultMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

export function AdminAccountsPage() {
  usePageTitle("Accounts");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteTarget, setDeleteTarget] = useState<AdminUserOverview | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<AdminUserOverview | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState(defaultMeta);
  const [roles, setRoles] = useState<AdminRoleOption[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [users, setUsers] = useState<AdminUserOverview[]>([]);
  const page = getPageParam(searchParams);
  const query = searchParams.get("q") ?? "";
  const roleName = searchParams.get("role") ?? "";
  const sortBy = getSortParam(searchParams.get("sort"));
  const storeName = searchParams.get("store") ?? "";

  useEffect(() => {
    let isMounted = true;
    async function loadFilterOptions() {
      try {
        const [rolesResponse, storesResponse] = await Promise.all([
          adminOptionsService.listRoles(),
          adminOptionsService.listStores(),
        ]);
        if (!isMounted) return;
        setRoles(rolesResponse.data.data ?? []);
        setStores(storesResponse.data.data ?? []);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      }
    }
    loadFilterOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await accountService.list({
        page,
        limit: 10,
        sortBy,
        sortOrder: "desc",
        ...(query.trim() ? { q: query.trim() } : {}),
        ...(roleName ? { roleName } : {}),
        ...(storeName ? { storeName } : {}),
      });
      setUsers(response.data.data ?? []);
      setMeta(response.data.meta ?? defaultMeta);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [page, query, roleName, sortBy, storeName]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function openDetail(user: AdminUserOverview) {
    setDetailUser(user);
    setDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const response = await accountService.getById(user.id);
      setDetailUser(response.data.data ?? user);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminAccountService.delete(deleteTarget.id);
      toast.success("Admin account deleted successfully");
      setDeleteTarget(null);
      loadUsers();
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDelete(user: AdminUserOverview) {
    if (!isAdminAccount(user)) {
      toast.info("User delete is not implemented yet");
      return;
    }
    setDeleteTarget(user);
  }

  function handleEdit(user: AdminUserOverview) {
    if (!isAdminAccount(user)) {
      toast.info("User edit is not implemented yet");
      return;
    }
    navigate(`/admin/admin-accounts/${user.id}/edit`);
  }

  function updateFilters(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  return (
    <AdminDashboardShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Accounts</h1>
          <p className="text-sm text-muted-foreground">Browse users, super admins, and store admins.</p>
        </div>
        <Button asChild><Link to="/admin/admin-accounts/new"><PlusIcon className="size-4" />Create Admin Account</Link></Button>
      </div>
      <section className="overflow-hidden rounded-lg border border-border bg-background">
        <AccountFilters
          query={query}
          roleName={roleName}
          roles={roles}
          sortBy={sortBy}
          storeName={storeName}
          stores={stores}
          onChangePage={(nextPage) => updateFilters({ page: nextPage })}
          onChangeQuery={(value) => updateFilters({ q: value, page: 1 })}
          onChangeRoleName={(value) => updateFilters({ role: value, page: 1 })}
          onChangeSortBy={(value) => updateFilters({ sort: value, page: 1 })}
          onChangeStoreName={(value) => updateFilters({ store: value, page: 1 })}
        />
        <AccountsTable
          isLoading={isLoading}
          accounts={users}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onView={openDetail}
        />
        <PaginationFooter meta={meta} onPageChange={(nextPage) => updateFilters({ page: nextPage })} />
      </section>
      <AccountDetailDialog account={detailUser} isLoading={isDetailLoading} open={detailOpen} onOpenChange={setDetailOpen} />
      <DeleteAdminAccountDialog accountName={deleteTarget?.name ?? ""} isDeleting={isDeleting} open={Boolean(deleteTarget)} onConfirm={confirmDelete} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </AdminDashboardShell>
  );
}

function getSortParam(value: string | null): AccountSortBy {
  return value === "roleName" || value === "storeName" ? value : "createdAt";
}

function isAdminAccount(user: AdminUserOverview) {
  return user.role?.name === "superAdmin" || user.role?.name === "storeAdmin";
}

function PaginationFooter({ meta, onPageChange }: { meta: PaginationMeta; onPageChange: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
      <span className="text-muted-foreground">Page {meta.page} of {meta.totalPages || 1}</span>
      <div className="flex gap-2">
        <Button variant="outline" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>Previous</Button>
        <Button variant="outline" disabled={meta.page >= meta.totalPages} onClick={() => onPageChange(meta.page + 1)}>Next</Button>
      </div>
    </div>
  );
}
