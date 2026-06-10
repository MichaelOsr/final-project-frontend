import { PencilIcon, Trash2Icon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { AdminDataTable } from "@/features/admin/shared/components/AdminDataTable";
import type { SortOrder } from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import type { AdminCategory } from "../types/adminCategory.types";

interface CategoriesTableProps {
  categories: AdminCategory[];
  isLoading: boolean;
  paginationMeta: PaginationMeta;
  sortBy: CategorySortBy;
  sortOrder: SortOrder;
  onDelete: (category: AdminCategory) => void;
  onEdit: (category: AdminCategory) => void;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: CategorySortBy, sortOrder: SortOrder) => void;
}

export type CategorySortBy = "name" | "createdAt" | "updatedAt";

export function CategoriesTable(props: CategoriesTableProps) {
  return (
    <AdminDataTable
      columns={getCategoryColumns(props)}
      data={props.categories}
      emptyMessage="No categories found."
      isLoading={props.isLoading}
      loadingMessage="Loading categories..."
      minWidth="min-w-[620px]"
      pagination={{ meta: props.paginationMeta, onPageChange: props.onPageChange }}
      sorting={{ sortBy: props.sortBy, sortOrder: props.sortOrder, onSortChange: (nextSortBy, nextOrder) => props.onSortChange(nextSortBy as CategorySortBy, nextOrder) }}
    />
  );
}

function getCategoryColumns({ onDelete, onEdit }: CategoriesTableProps): ColumnDef<AdminCategory>[] {
  return [
    { accessorKey: "name", header: "Category", enableSorting: true, cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { id: "createdAt", header: "Created", enableSorting: true, cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span> },
    { id: "updatedAt", header: "Updated", enableSorting: true, cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.updatedAt)}</span> },
    { id: "actions", header: () => <div className="text-center">Actions</div>, cell: ({ row }) => <CategoryActions category={row.original} onDelete={onDelete} onEdit={onEdit} /> },
  ];
}

function CategoryActions({
  category,
  onDelete,
  onEdit,
}: {
  category: AdminCategory;
  onDelete: (category: AdminCategory) => void;
  onEdit: (category: AdminCategory) => void;
}) {
  return (
    <div className="flex justify-center gap-1">
      <Button variant="ghost" size="icon-sm" onClick={() => onEdit(category)} aria-label="Edit category"><PencilIcon className="size-4" /></Button>
      <Button variant="ghost" size="icon-sm" onClick={() => onDelete(category)} aria-label="Delete category"><Trash2Icon className="size-4 text-destructive" /></Button>
    </div>
  );
}
