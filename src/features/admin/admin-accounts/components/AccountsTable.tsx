import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminDataTable } from "@/features/admin/shared/components/AdminDataTable";
import type { SortOrder } from "@/features/admin/shared/components/AdminDataTable";
import type { AdminUserOverview, PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { formatDate, formatRoleName } from "@/features/admin/shared/utils/adminFormat";

interface AccountsTableProps {
  isLoading: boolean;
  accounts: AdminUserOverview[];
  onDelete: (account: AdminUserOverview) => void;
  onEdit: (account: AdminUserOverview) => void;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: AccountSortBy, sortOrder: SortOrder) => void;
  onView: (account: AdminUserOverview) => void;
  paginationMeta: PaginationMeta;
  sortBy: AccountSortBy;
  sortOrder: SortOrder;
}

export type AccountSortBy = "name" | "email" | "roleName" | "storeName" | "createdAt";

export function AccountsTable({
  accounts,
  isLoading,
  onDelete,
  onEdit,
  onPageChange,
  onSortChange,
  onView,
  paginationMeta,
  sortBy,
  sortOrder,
}: AccountsTableProps) {
  const columns = getAccountColumns({ onDelete, onEdit, onView });

  return (
    <AdminDataTable
      columns={columns}
      data={accounts}
      emptyMessage="No accounts found."
      isLoading={isLoading}
      loadingMessage="Loading accounts..."
      minWidth="min-w-[760px]"
      pagination={{ meta: paginationMeta, onPageChange }}
      sorting={{ sortBy, sortOrder, onSortChange: (nextSortBy, nextOrder) => onSortChange(nextSortBy as AccountSortBy, nextOrder) }}
    />
  );
}

function getAccountColumns({
  onDelete,
  onEdit,
  onView,
}: Pick<AccountsTableProps, "onDelete" | "onEdit" | "onView">): ColumnDef<AdminUserOverview>[] {
  return [
    { accessorKey: "name", header: "Name", enableSorting: true, cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "email", header: "Email", enableSorting: true, cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span> },
    { id: "roleName", header: "Role", enableSorting: true, cell: ({ row }) => <span className="text-muted-foreground">{formatRoleName(row.original.role?.name)}</span> },
    { id: "storeName", header: "Store", enableSorting: true, cell: ({ row }) => <span className="text-muted-foreground">{row.original.store?.name ?? "-"}</span> },
    { id: "status", header: "Status", cell: ({ row }) => <VerificationBadge isVerified={row.original.isVerified} /> },
    { id: "createdAt", header: "Created", enableSorting: true, cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span> },
    { id: "actions", header: () => <div className="text-center">Actions</div>, cell: ({ row }) => <AccountActions account={row.original} onDelete={onDelete} onEdit={onEdit} onView={onView} /> },
  ];
}

function AccountActions({ account, onDelete, onEdit, onView }: {
  account: AdminUserOverview;
  onDelete: (account: AdminUserOverview) => void;
  onEdit: (account: AdminUserOverview) => void;
  onView: (account: AdminUserOverview) => void;
}) {
  const isUserAccount = account.role?.name === "user";

  return (
    <div className="flex justify-center gap-1">
      <Button variant="ghost" size="icon-sm" onClick={() => onView(account)} aria-label="View account"><EyeIcon className="size-4" /></Button>
      {!isUserAccount ? (
        <>
          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(account)} aria-label="Edit account"><PencilIcon className="size-4" /></Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onDelete(account)} aria-label="Delete account"><Trash2Icon className="size-4 text-destructive" /></Button>
        </>
      ) : null}
    </div>
  );
}

function VerificationBadge({ isVerified }: { isVerified: boolean }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", isVerified ? "bg-accent text-primary" : "bg-muted text-muted-foreground")}>
      {isVerified ? "Verified" : "Pending"}
    </span>
  );
}
