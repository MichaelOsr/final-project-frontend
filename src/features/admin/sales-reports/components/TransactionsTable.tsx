import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminDataTable } from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import type { TransactionItem } from "../types/transactionReport.types";

interface TransactionsTableProps {
  items: TransactionItem[];
  isLoading: boolean;
  meta: PaginationMeta;
  // Hidden in store-context mode, where every row repeats the same store.
  showStoreColumn?: boolean;
  onPageChange: (page: number) => void;
  onView: (item: TransactionItem) => void;
}

export function TransactionsTable({
  items,
  isLoading,
  meta,
  showStoreColumn = true,
  onPageChange,
  onView,
}: TransactionsTableProps) {
  const columns = useMemo<ColumnDef<TransactionItem>[]>(
    () => transactionColumns(onView, showStoreColumn),
    [onView, showStoreColumn],
  );

  return (
    <AdminDataTable
      columns={columns}
      data={items}
      isLoading={isLoading}
      skeletonRows={meta.limit}
      emptyMessage="No transactions for the selected filters."
      minWidth={showStoreColumn ? "min-w-[760px]" : "min-w-[660px]"}
      pagination={{ meta, onPageChange }}
    />
  );
}

function transactionColumns(
  onView: (item: TransactionItem) => void,
  showStoreColumn: boolean,
): ColumnDef<TransactionItem>[] {
  return [
    {
      id: "reportDate",
      accessorKey: "reportDate",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.reportDate),
    },
    {
      id: "transactionId",
      accessorKey: "transactionId",
      header: "Transaction ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.transactionId.slice(0, 8)}...
        </span>
      ),
    },
    {
      id: "status",
      accessorKey: "transactionStatus",
      header: "Status",
      cell: ({ row }) => <TransactionStatusBadge status={row.original.transactionStatus} />,
    },
    ...(showStoreColumn
      ? [
          {
            id: "store",
            accessorKey: "store.name",
            header: "Store",
            cell: ({ row }: { row: { original: TransactionItem } }) => row.original.store.name,
          } satisfies ColumnDef<TransactionItem>,
        ]
      : []),
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.customer.name ?? "Not available"}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.customer.email ?? "Not available"}
          </p>
        </div>
      ),
    },
    {
      id: "totalRevenue",
      accessorKey: "totalRevenue",
      header: "Total Revenue",
      cell: ({ row }) => (
        <span className="font-medium">{formatPrice(row.original.totalRevenue)}</span>
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
  ];
}
