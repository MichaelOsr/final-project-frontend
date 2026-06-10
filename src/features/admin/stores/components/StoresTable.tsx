import { Link } from "react-router-dom";
import { EyeIcon, LayoutDashboardIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { AdminDataTable } from "@/features/admin/shared/components/AdminDataTable";
import type { SortOrder } from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import type { AdminStore } from "../types/adminStore.types";

interface StoresTableProps {
  isLoading: boolean;
  stores: AdminStore[];
  onDelete: () => void;
  onEdit: () => void;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: StoreSortBy, sortOrder: SortOrder) => void;
  onView: (store: AdminStore) => void;
  paginationMeta: PaginationMeta;
  sortBy: StoreSortBy;
  sortOrder: SortOrder;
}

export type StoreSortBy = "name" | "createdAt" | "updatedAt";

export function StoresTable({
  isLoading,
  stores,
  onDelete,
  onEdit,
  onPageChange,
  onSortChange,
  onView,
  paginationMeta,
  sortBy,
  sortOrder,
}: StoresTableProps) {
  const columns = getStoreColumns({ onDelete, onEdit, onView });

  return (
    <AdminDataTable
      columns={columns}
      data={stores}
      emptyMessage="No stores found."
      isLoading={isLoading}
      loadingMessage="Loading stores..."
      minWidth="min-w-[680px]"
      pagination={{ meta: paginationMeta, onPageChange }}
      sorting={{ sortBy, sortOrder, onSortChange: (nextSortBy, nextOrder) => onSortChange(nextSortBy as StoreSortBy, nextOrder) }}
    />
  );
}

function getStoreColumns({
  onDelete,
  onEdit,
  onView,
}: Pick<StoresTableProps, "onDelete" | "onEdit" | "onView">): ColumnDef<AdminStore>[] {
  return [
    { accessorKey: "name", header: "Store", enableSorting: true, cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "latitude", header: "Latitude", cell: ({ row }) => <span className="text-muted-foreground">{row.original.latitude ?? "-"}</span> },
    { accessorKey: "longitude", header: "Longitude", cell: ({ row }) => <span className="text-muted-foreground">{row.original.longitude ?? "-"}</span> },
    { id: "updatedAt", header: "Updated", enableSorting: true, cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.updatedAt)}</span> },
    { id: "dashboard", header: () => <div className="text-center">Dashboard</div>, cell: ({ row }) => <DashboardAction store={row.original} /> },
    { id: "manage", header: () => <div className="text-center">Manage</div>, cell: ({ row }) => <StoreActions store={row.original} onDelete={onDelete} onEdit={onEdit} onView={onView} /> },
  ];
}

function DashboardAction({ store }: { store: AdminStore }) {
  return (
    <div className="flex justify-center gap-1">
      <Button asChild variant="ghost" size="icon-sm" aria-label="Open store dashboard">
        <Link to={`/admin/store/dashboard?storeId=${store.id}`}><LayoutDashboardIcon className="size-4" /></Link>
      </Button>
    </div>
  );
}

function StoreActions({
  store,
  onDelete,
  onEdit,
  onView,
}: {
  store: AdminStore;
  onDelete: () => void;
  onEdit: () => void;
  onView: (store: AdminStore) => void;
}) {
  return (
    <div className="flex justify-center gap-1">
      <Button variant="ghost" size="icon-sm" onClick={() => onView(store)} aria-label="View store"><EyeIcon className="size-4" /></Button>
      <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Edit store"><PencilIcon className="size-4" /></Button>
      <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label="Delete store"><Trash2Icon className="size-4 text-destructive" /></Button>
    </div>
  );
}
