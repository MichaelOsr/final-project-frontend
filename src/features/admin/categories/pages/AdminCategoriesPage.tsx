import { useEffect, useState } from "react";
import type { FormikHelpers } from "formik";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useDebouncedSearchParam } from "@/features/admin/shared/hooks/useDebouncedSearchParam";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import type { SortOrder } from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import { useSearchParams } from "react-router-dom";
import { CategoriesTable, type CategorySortBy } from "../components/CategoriesTable";
import { CategoryFilters } from "../components/CategoryFilters";
import { CategoryFormDialog } from "../components/CategoryFormDialog";
import { DeleteCategoryDialog } from "../components/DeleteCategoryDialog";
import { adminCategoryService } from "../services/adminCategory.service";
import type { AdminCategory, CategoryFormValues } from "../types/adminCategory.types";

const defaultMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };
const emptyValues: CategoryFormValues = { name: "" };

export function AdminCategoriesPage() {
  usePageTitle("Categories");
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [editTarget, setEditTarget] = useState<AdminCategory | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState(defaultMeta);
  const [searchInput, setSearchInput] = useDebouncedSearchParam("q");
  const page = getPageParam(searchParams);
  const query = searchParams.get("q") ?? "";
  const refreshKey = searchParams.get("refresh") ?? "";
  const sortBy = getSortParam(searchParams.get("sort"));
  const sortOrder = getSortOrderParam(searchParams.get("order"), sortBy);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const response = await adminCategoryService.list({
          page,
          limit: 10,
          sortBy,
          sortOrder,
          ...(query.trim() ? { q: query.trim() } : {}),
        });
        if (!isMounted) return;
        setCategories(response.data.data ?? []);
        setMeta(response.data.meta ?? defaultMeta);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [page, query, refreshKey, sortBy, sortOrder]);

  async function submitCategory(values: CategoryFormValues, helpers: FormikHelpers<CategoryFormValues>) {
    try {
      if (editTarget) await adminCategoryService.update(editTarget.id, { name: values.name.trim() });
      else await adminCategoryService.create({ name: values.name.trim() });
      toast.success(editTarget ? "Category updated successfully" : "Category created successfully");
      closeForm();
      refreshCurrentPage();
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
      await adminCategoryService.delete(deleteTarget.id);
      toast.success("Category deleted successfully");
      setDeleteTarget(null);
      refreshCurrentPage();
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(category: AdminCategory) {
    setEditTarget(category);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditTarget(null);
  }

  function refreshCurrentPage() {
    setIsLoading(true);
    setSearchParams(updateSearchParams(searchParams, { refresh: Date.now() }));
  }

  function updateFilters(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  return (
    <AdminDashboardShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage product category names for catalog forms and filters.</p>
        </div>
        <Button type="button" onClick={openCreate}><PlusIcon className="size-4" />Create Category</Button>
      </div>
      <Card className="rounded-lg p-0">
        <CardContent className="overflow-hidden p-0">
          <CategoryFilters
            query={searchInput}
            onChangePage={(nextPage) => updateFilters({ page: nextPage })}
            onChangeQuery={setSearchInput}
          />
          <CategoriesTable
            categories={categories}
            isLoading={isLoading}
            onDelete={setDeleteTarget}
            onEdit={openEdit}
            onPageChange={(nextPage) => updateFilters({ page: nextPage })}
            onSortChange={(nextSortBy, nextOrder) => updateFilters({ sort: nextSortBy, order: nextOrder, page: 1 })}
            paginationMeta={meta}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </CardContent>
      </Card>
      <CategoryFormDialog initialValues={editTarget ? { name: editTarget.name } : emptyValues} isEdit={Boolean(editTarget)} open={formOpen} onOpenChange={(open) => (open ? setFormOpen(true) : closeForm())} onSubmit={submitCategory} />
      <DeleteCategoryDialog categoryName={deleteTarget?.name ?? ""} isDeleting={isDeleting} open={Boolean(deleteTarget)} onConfirm={confirmDelete} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </AdminDashboardShell>
  );
}

function getSortParam(value: string | null): CategorySortBy {
  if (value === "createdAt" || value === "updatedAt") return value;
  return "name";
}

function getSortOrderParam(value: string | null, sortBy: CategorySortBy): SortOrder {
  if (value === "asc" || value === "desc") return value;
  return sortBy === "name" ? "asc" : "desc";
}
