import { useEffect, useState } from "react";
import type { FormikHelpers } from "formik";
import { useSearchParams } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useDebouncedSearchParam } from "@/features/admin/shared/hooks/useDebouncedSearchParam";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import type { SortOrder } from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import { DeleteStoreDialog } from "../components/DeleteStoreDialog";
import { StoreDetailDialog } from "../components/StoreDetailDialog";
import { StoreFilters } from "../components/StoreFilters";
import { StoreFormDialog } from "../components/StoreFormDialog";
import { StoresTable, type StoreSortBy } from "../components/StoresTable";
import { adminStoreService } from "../services/adminStore.service";
import type { AdminStore, StoreFormValues } from "../types/adminStore.types";

const defaultMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };
const emptyValues: StoreFormValues = { name: "", latitude: "", longitude: "" };

export function AdminStoresPage() {
  usePageTitle("Stores");
  const [searchParams, setSearchParams] = useSearchParams();

  const [stores, setStores] = useState<AdminStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState(defaultMeta);
  const [refreshKey, setRefreshKey] = useState(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStore, setDetailStore] = useState<AdminStore | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminStore | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminStore | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchInput, setSearchInput] = useDebouncedSearchParam("q");
  const page = getPageParam(searchParams);
  const query = searchParams.get("q") ?? "";
  const sortBy = getSortParam(searchParams.get("sort"));
  const sortOrder = getSortOrderParam(searchParams.get("order"), sortBy);

  useEffect(() => {
    let isMounted = true;
    async function loadStores() {
      try {
        const response = await adminStoreService.list({
          page,
          limit: 10,
          sortBy,
          sortOrder,
          ...(query.trim() ? { q: query.trim() } : {}),
        });
        if (!isMounted) return;
        setStores(response.data.data ?? []);
        setMeta(response.data.meta ?? defaultMeta);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadStores();
    return () => {
      isMounted = false;
    };
  }, [page, query, sortBy, sortOrder, refreshKey]);

  async function openDetail(store: AdminStore) {
    setDetailStore(store);
    setDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const response = await adminStoreService.getById(store.id);
      setDetailStore(response.data.data ?? store);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsDetailLoading(false);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(store: AdminStore) {
    setEditTarget(store);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditTarget(null);
  }

  async function submitStore(
    values: StoreFormValues,
    helpers: FormikHelpers<StoreFormValues>,
  ) {
    const payload = {
      name: values.name.trim(),
      latitude: values.latitude.trim() || null,
      longitude: values.longitude.trim() || null,
    };
    try {
      if (editTarget) {
        await adminStoreService.update(editTarget.id, payload);
      } else {
        await adminStoreService.create(payload);
      }
      toast.success(
        editTarget ? "Store updated successfully" : "Store created successfully",
      );
      closeForm();
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      helpers.setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminStoreService.delete(deleteTarget.id);
      toast.success("Store deleted successfully");
      setDeleteTarget(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  function updateFilters(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  const formInitialValues: StoreFormValues = editTarget
    ? {
        name: editTarget.name,
        latitude: editTarget.latitude ?? "",
        longitude: editTarget.longitude ?? "",
      }
    : emptyValues;

  return (
    <AdminDashboardShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Stores</h1>
          <p className="text-sm text-muted-foreground">Manage store locations and coordinates.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <PlusIcon className="size-4" />
          Create Store
        </Button>
      </div>
      <section className="overflow-hidden rounded-lg border border-border bg-background">
        <StoreFilters
          query={searchInput}
          onChangePage={(nextPage) => updateFilters({ page: nextPage })}
          onChangeQuery={setSearchInput}
        />
        <StoresTable
          stores={stores}
          isLoading={isLoading}
          onDelete={setDeleteTarget}
          onEdit={openEdit}
          onPageChange={(nextPage) => updateFilters({ page: nextPage })}
          onSortChange={(nextSortBy, nextOrder) => updateFilters({ sort: nextSortBy, order: nextOrder, page: 1 })}
          onView={openDetail}
          paginationMeta={meta}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </section>
      <StoreFormDialog
        initialValues={formInitialValues}
        isEdit={Boolean(editTarget)}
        open={formOpen}
        onOpenChange={(open) => (open ? setFormOpen(true) : closeForm())}
        onSubmit={submitStore}
      />
      <StoreDetailDialog
        store={detailStore}
        isLoading={isDetailLoading}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <DeleteStoreDialog
        storeName={deleteTarget?.name ?? ""}
        isDeleting={isDeleting}
        open={Boolean(deleteTarget)}
        onConfirm={confirmDelete}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </AdminDashboardShell>
  );
}

function getSortParam(value: string | null): StoreSortBy {
  if (value === "createdAt" || value === "updatedAt") return value;
  return "name";
}

function getSortOrderParam(value: string | null, sortBy: StoreSortBy): SortOrder {
  if (value === "asc" || value === "desc") return value;
  return sortBy === "name" ? "asc" : "desc";
}
