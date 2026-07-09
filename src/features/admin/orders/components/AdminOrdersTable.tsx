import type { ColumnDef } from "@tanstack/react-table"
import { EyeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminDataTable } from "@/features/admin/shared/components/AdminDataTable"
import type { SortOrder } from "@/features/admin/shared/components/AdminDataTable"
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types"
import { formatDate } from "@/features/admin/shared/utils/adminFormat"
import { OrderStatusBadge } from "@/features/order/components/OrderStatusBadge"
import { formatPrice } from "@/lib/format"
import type { AdminOrderSummary, AdminOrderSortBy } from "../types/adminOrder.types"

interface AdminOrdersTableProps {
  orders: AdminOrderSummary[]
  isLoading: boolean
  paginationMeta: PaginationMeta
  onPageChange: (page: number) => void
  onView: (order: AdminOrderSummary) => void
  sortBy: AdminOrderSortBy
  sortOrder: SortOrder
  onSortChange: (sortBy: AdminOrderSortBy, sortOrder: SortOrder) => void
}

export function AdminOrdersTable({
  orders,
  isLoading,
  paginationMeta,
  onPageChange,
  onView,
  sortBy,
  sortOrder,
  onSortChange,
}: AdminOrdersTableProps) {
  return (
    <AdminDataTable
      columns={getOrderColumns({ onView })}
      data={orders}
      emptyMessage="No transactions found."
      isLoading={isLoading}
      loadingMessage="Loading transactions..."
      minWidth="min-w-[780px]"
      pagination={{ meta: paginationMeta, onPageChange }}
      sorting={{
        sortBy,
        sortOrder,
        onSortChange: (nextSortBy, nextOrder) =>
          onSortChange(nextSortBy as AdminOrderSortBy, nextOrder),
      }}
    />
  )
}

function getOrderColumns({
  onView,
}: Pick<AdminOrdersTableProps, "onView">): ColumnDef<AdminOrderSummary>[] {
  return [
    {
      id: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.customer.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.customer.email}</p>
        </div>
      ),
    },
    {
      id: "store",
      header: "Store",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.store.name}</span>
      ),
    },
    {
      accessorKey: "totalPrice",
      header: "Total",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm font-medium">{formatPrice(row.original.totalPrice)}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <OrderStatusBadge status={row.original.transactionStatus} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onView(row.original)}
            aria-label="View transaction"
          >
            <EyeIcon className="size-4" />
          </Button>
        </div>
      ),
    },
  ]
}