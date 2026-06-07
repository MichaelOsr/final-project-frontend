import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { AdminDataTable } from "@/features/admin/shared/components/AdminDataTable";
import type { SortOrder } from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import type { AdminProduct } from "../types/adminProduct.types";

const priceFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

interface ProductsTableProps {
  isLoading: boolean;
  products: AdminProduct[];
  onDelete: (product: AdminProduct) => void;
  onEdit: (product: AdminProduct) => void;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: ProductSortBy, sortOrder: SortOrder) => void;
  onView: (product: AdminProduct) => void;
  paginationMeta: PaginationMeta;
  sortBy: ProductSortBy;
  sortOrder: SortOrder;
}

export type ProductSortBy = "name" | "sku" | "brand" | "price" | "categoryName" | "createdAt" | "updatedAt";

export function ProductsTable(props: ProductsTableProps) {
  return (
    <AdminDataTable
      columns={getProductColumns(props)}
      data={props.products}
      emptyMessage="No products found."
      isLoading={props.isLoading}
      loadingMessage="Loading products..."
      minWidth="min-w-[880px]"
      pagination={{ meta: props.paginationMeta, onPageChange: props.onPageChange }}
      sorting={{ sortBy: props.sortBy, sortOrder: props.sortOrder, onSortChange: (nextSortBy, nextOrder) => props.onSortChange(nextSortBy as ProductSortBy, nextOrder) }}
    />
  );
}

function getProductColumns({ onDelete, onEdit, onView }: ProductsTableProps): ColumnDef<AdminProduct>[] {
  return [
    { accessorKey: "name", header: "Product", enableSorting: true, cell: ({ row }) => <ProductName product={row.original} /> },
    { accessorKey: "sku", header: "SKU", enableSorting: true, cell: ({ row }) => <span className="text-muted-foreground">{row.original.sku}</span> },
    { accessorKey: "brand", header: "Brand", enableSorting: true, cell: ({ row }) => <span className="text-muted-foreground">{row.original.brand ?? "-"}</span> },
    { id: "categoryName", header: "Category", enableSorting: true, cell: ({ row }) => <span className="text-muted-foreground">{row.original.category?.name ?? "-"}</span> },
    { accessorKey: "price", header: "Price", enableSorting: true, cell: ({ row }) => <span className="font-medium">{priceFormatter.format(row.original.price)}</span> },
    { id: "updatedAt", header: "Updated", enableSorting: true, cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.updatedAt)}</span> },
    { id: "actions", header: () => <div className="text-center">Actions</div>, cell: ({ row }) => <ProductActions product={row.original} onDelete={onDelete} onEdit={onEdit} onView={onView} /> },
  ];
}

function ProductName({ product }: { product: AdminProduct }) {
  const image = product.images?.[0]?.image;
  return (
    <div className="flex items-center gap-3">
      <div className="size-10 overflow-hidden rounded-md bg-muted">
        {image ? <img src={image} alt={product.name} className="size-full object-cover object-top" /> : null}
      </div>
      <div>
        <p className="font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.variant || product.size || product.slug}</p>
      </div>
    </div>
  );
}

function ProductActions({ product, onDelete, onEdit, onView }: {
  product: AdminProduct;
  onDelete: (product: AdminProduct) => void;
  onEdit: (product: AdminProduct) => void;
  onView: (product: AdminProduct) => void;
}) {
  return (
    <div className="flex justify-center gap-1">
      <Button variant="ghost" size="icon-sm" onClick={() => onView(product)} aria-label="View product"><EyeIcon className="size-4" /></Button>
      <Button variant="ghost" size="icon-sm" onClick={() => onEdit(product)} aria-label="Edit product"><PencilIcon className="size-4" /></Button>
      <Button variant="ghost" size="icon-sm" onClick={() => onDelete(product)} aria-label="Delete product"><Trash2Icon className="size-4 text-destructive" /></Button>
    </div>
  );
}
