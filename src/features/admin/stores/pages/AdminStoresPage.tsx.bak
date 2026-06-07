import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import type { SortOrder } from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import { StoreDetailDialog } from "../components/StoreDetailDialog";
import { StoreFilters } from "../components/StoreFilters";
import { StoresTable, type StoreSortBy } from "../components/StoresTable";
import { adminStoreService } from "../services/adminStore.service";
import type { AdminStore } from "../types/adminStore.types";

const defaultMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

export function AdminStoresPage() {
  usePageTitle("Stores");
  const [searchParams, setSearchParams] = useSearchParams();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStore, setDetailStore] = useState<AdminStore | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState(defaultMeta);
  const [stores, setStores] = useState<AdminStore[]>([]);
  const page = getPageParam(searchParams);
  const query = searchParams.get("q") ?? "";
  const sortBy = getSortParam(searchParams.get("sort"));
  const sortOrder = getSortOrderParam(searchParams.get("order"), sortBy);

  const loadStores = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminStoreService.list({
        page,
        limit: 10,
        sortBy,
        sortOrder,
        ...(query.trim() ? { q: query.trim() } : {}),
      });
      setStores(response.data.data ?? []);
      setMeta(response.data.meta ?? defaultMeta);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [page, query, sortBy, sortOrder]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

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

  function showNotImplemented() {
    toast.info("Store management is not implemented yet");
  }

  function updateFilters(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  return (
    <AdminDashboardShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Stores</h1>
          <p className="text-sm text-muted-foreground">Manage store locations and coordinates.</p>
        </div>
        <Button type="button" onClick={showNotImplemented}>
          <PlusIcon className="size-4" />
          Create Store
        </Button>
      </div>
      <section className="overflow-hidden rounded-lg border border-border bg-background">
        <StoreFilters
          query={query}
          onChangePage={(nextPage) => updateFilters({ page: nextPage })}
          onChangeQuery={(value) => updateFilters({ q: value, page: 1 })}
        />
        <StoresTable
          stores={stores}
          isLoading={isLoading}
          onDelete={showNotImplemented}
          onEdit={showNotImplemented}
          onPageChange={(nextPage) => updateFilters({ page: nextPage })}
          onSortChange={(nextSortBy, nextOrder) => updateFilters({ sort: nextSortBy, order: nextOrder, page: 1 })}
          onView={openDetail}
          paginationMeta={meta}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </section>
      <StoreDetailDialog store={detailStore} isLoading={isDetailLoading} open={detailOpen} onOpenChange={setDetailOpen} />
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
