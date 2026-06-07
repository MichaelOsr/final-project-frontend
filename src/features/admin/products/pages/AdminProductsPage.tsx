import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { DeleteProductDialog } from "../components/DeleteProductDialog";
import { ProductFilters } from "../components/ProductFilters";
import { ProductsTable, type ProductSortBy } from "../components/ProductsTable";
import { adminProductService } from "../services/adminProduct.service";
import type { AdminProduct, ProductCategory } from "../types/adminProduct.types";

const defaultMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

export function AdminProductsPage() {
  usePageTitle("Products");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState(defaultMeta);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchInput, setSearchInput] = useDebouncedSearchParam("q");
  const page = getPageParam(searchParams);
  const query = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const sortBy = getSortParam(searchParams.get("sort"));
  const sortOrder = getSortOrderParam(searchParams.get("order"));

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const response = await adminProductService.listCategories();
        if (isMounted) setCategories(response.data.data ?? []);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const response = await adminProductService.list({
          page,
          limit: 10,
          sortBy,
          sortOrder,
          ...(query.trim() ? { q: query.trim() } : {}),
          ...(categoryId ? { categoryId } : {}),
        });
        if (!isMounted) return;
        setProducts(response.data.data ?? []);
        setMeta(response.data.meta ?? defaultMeta);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [categoryId, page, query, sortBy, sortOrder]);

  function openDetail(product: AdminProduct) {
    navigate(`/admin/products/${product.slug}`);
  }

  function editProduct(product: AdminProduct) {
    navigate(`/admin/products/${product.slug}/edit`);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminProductService.delete(deleteTarget.slug);
      toast.success("Product deleted successfully");
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== deleteTarget.id));
      setMeta((currentMeta) => ({ ...currentMeta, total: Math.max(currentMeta.total - 1, 0) }));
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  function updateFilters(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  return (
    <AdminDashboardShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">Create and browse catalog products.</p>
        </div>
        <Button asChild>
          <Link to="/admin/products/new"><PlusIcon className="size-4" />Create Product</Link>
        </Button>
      </div>
      <Card className="rounded-lg p-0">
        <CardContent className="overflow-hidden p-0">
        <ProductFilters
          categories={categories}
          categoryId={categoryId}
          query={searchInput}
          onChangeCategory={(value) => updateFilters({ categoryId: value, page: 1 })}
          onChangePage={(nextPage) => updateFilters({ page: nextPage })}
          onChangeQuery={setSearchInput}
        />
        <ProductsTable
          isLoading={isLoading}
          products={products}
          onDelete={setDeleteTarget}
          onEdit={editProduct}
          onPageChange={(nextPage) => updateFilters({ page: nextPage })}
          onSortChange={(nextSortBy, nextOrder) => updateFilters({ sort: nextSortBy, order: nextOrder, page: 1 })}
          onView={openDetail}
          paginationMeta={meta}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
        </CardContent>
      </Card>
      <DeleteProductDialog
        isDeleting={isDeleting}
        open={Boolean(deleteTarget)}
        productName={deleteTarget?.name ?? ""}
        onConfirm={confirmDelete}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </AdminDashboardShell>
  );
}

function getSortParam(value: string | null): ProductSortBy {
  if (value === "name" || value === "sku" || value === "brand" || value === "price" || value === "categoryName" || value === "updatedAt") return value;
  return "createdAt";
}

function getSortOrderParam(value: string | null): SortOrder {
  return value === "asc" ? "asc" : "desc";
}
