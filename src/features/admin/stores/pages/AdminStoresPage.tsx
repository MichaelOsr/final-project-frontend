import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import { StoreDetailDialog } from "../components/StoreDetailDialog";
import { StoreFilters, type StoreSortBy } from "../components/StoreFilters";
import { StoresTable } from "../components/StoresTable";
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

  const loadStores = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminStoreService.list({
        page,
        limit: 10,
        sortBy,
        sortOrder: sortBy === "name" ? "asc" : "desc",
        ...(query.trim() ? { q: query.trim() } : {}),
      });
      setStores(response.data.data ?? []);
      setMeta(response.data.meta ?? defaultMeta);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [page, query, sortBy]);

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
          sortBy={sortBy}
          onChangePage={(nextPage) => updateFilters({ page: nextPage })}
          onChangeQuery={(value) => updateFilters({ q: value, page: 1 })}
          onChangeSortBy={(value) => updateFilters({ sort: value, page: 1 })}
        />
        <StoresTable
          stores={stores}
          isLoading={isLoading}
          onDelete={showNotImplemented}
          onEdit={showNotImplemented}
          onView={openDetail}
        />
        <PaginationFooter meta={meta} onPageChange={(nextPage) => updateFilters({ page: nextPage })} />
      </section>
      <StoreDetailDialog store={detailStore} isLoading={isDetailLoading} open={detailOpen} onOpenChange={setDetailOpen} />
    </AdminDashboardShell>
  );
}

function getSortParam(value: string | null): StoreSortBy {
  if (value === "createdAt" || value === "updatedAt") return value;
  return "name";
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
