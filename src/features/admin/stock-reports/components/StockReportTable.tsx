import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import {
  AdminDataTable,
  type SortOrder,
} from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { formatNumber } from "@/features/admin/shared/utils/adminFormat";
import {
  getMovementBadgeClass,
  getMovementLabel,
} from "@/features/admin/store-dashboard/utils/stockMovement";
import type {
  StockReportItem,
  StockReportSortBy,
} from "../types/stockReport.types";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface StockReportTableProps {
  items: StockReportItem[];
  isLoading: boolean;
  meta: PaginationMeta;
  sortBy: StockReportSortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: string, sortOrder: SortOrder) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelect?: (item: StockReportItem) => void;
  // Shows the store column — useful for super admin "all stores" view.
  showStore?: boolean;
}

const dash = (value: number | null) =>
  value === null ? "—" : formatNumber(value);

function formatTimestamp(value: string) {
  const date = parseISO(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : format(date, "dd MMM yyyy HH:mm");
}

export function StockReportTable({
  items,
  isLoading,
  meta,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onSelect,
  showStore = false,
}: StockReportTableProps) {
  const columns = useMemo<ColumnDef<StockReportItem>[]>(
    () => [
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {formatTimestamp(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "productName",
        accessorKey: "productName",
        header: "Product",
        cell: ({ row }) =>
          onSelect ? (
            <button
              type="button"
              className="text-left font-medium hover:text-primary hover:underline"
              onClick={() => onSelect(row.original)}
            >
              {row.original.productName}
              <span className="block text-xs text-muted-foreground">
                {row.original.sku}
              </span>
            </button>
          ) : (
            <div className="font-medium">
              {row.original.productName}
              <span className="block text-xs text-muted-foreground">
                {row.original.sku}
              </span>
            </div>
          ),
      },
      ...(showStore
        ? [
            {
              id: "store",
              accessorKey: "storeName",
              header: "Store",
              enableSorting: false,
            } satisfies ColumnDef<StockReportItem>,
          ]
        : []),
      {
        id: "category",
        accessorKey: "categoryName",
        header: "Category",
        enableSorting: false,
        cell: ({ row }) => row.original.categoryName || "—",
      },
      {
        id: "type",
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span
            className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getMovementBadgeClass(
              row.original.type,
            )}`}
          >
            {getMovementLabel(row.original.type)}
          </span>
        ),
      },
      {
        id: "quantity",
        accessorKey: "quantity",
        header: "Qty",
        cell: ({ row }) => dash(row.original.quantity),
      },
      {
        id: "stockAfter",
        accessorKey: "stockAfter",
        header: "Before → After",
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {dash(row.original.stockBefore)} → {dash(row.original.stockAfter)}
          </span>
        ),
      },
      {
        id: "netChange",
        accessorKey: "netChange",
        header: "Net",
        enableSorting: false,
        cell: ({ row }) => {
          const net = row.original.netChange;
          const color =
            net > 0 ? "text-green-600" : net < 0 ? "text-red-600" : "text-muted-foreground";
          return (
            <span className={`tabular-nums font-medium ${color}`}>
              {net > 0 ? `+${formatNumber(net)}` : formatNumber(net)}
            </span>
          );
        },
      },
      {
        id: "admin",
        accessorKey: "admin",
        header: "By",
        enableSorting: false,
        cell: ({ row }) => row.original.admin?.name ?? "System",
      },
    ],
    [onSelect, showStore],
  );

  return (
    <AdminDataTable
      columns={columns}
      data={items}
      isLoading={isLoading}
      skeletonRows={8}
      emptyMessage="No stock movements for the selected filters."
      minWidth="min-w-[820px]"
      pagination={{
        meta,
        onPageChange,
        pageSizeOptions: PAGE_SIZE_OPTIONS,
        onPageSizeChange,
      }}
      sorting={{ sortBy, sortOrder, onSortChange }}
    />
  );
}
