import type { ColumnDef } from "@tanstack/react-table";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminDataTable } from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import type { Voucher, VoucherSortField } from "../types/voucher.types";
import { formatVoucherValue, formatVoucherScope, getVoucherStatus } from "../utils/promoFormat";

const SORTABLE_FIELDS = new Set(["name", "code", "quantity", "startDate", "endDate", "storeName", "createdAt"]);

interface Props {
  vouchers: Voucher[];
  isLoading: boolean;
  meta: PaginationMeta;
  page: number;
  sortBy: VoucherSortField;
  sortOrder: "asc" | "desc";
  onSort: (field: VoucherSortField, order: "asc" | "desc") => void;
  onPageChange: (page: number) => void;
  onEdit: (voucher: Voucher) => void;
  onDelete: (voucher: Voucher) => void;
}

function buildColumns(onEdit: (v: Voucher) => void, onDelete: (v: Voucher) => void): ColumnDef<Voucher>[] {
  return [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "code", header: "Code", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { id: "voucherType", header: "For", enableSorting: false, cell: ({ row }) => row.original.voucherType === "transaction" ? "Transaction" : "Delivery" },
    { id: "discountType", header: "Discount", enableSorting: false, cell: ({ row }) => formatVoucherValue(row.original) },
    { accessorKey: "quantity", header: "Qty", cell: ({ row }) => row.original.quantity },
    { id: "scope", header: "Scope", enableSorting: false, cell: ({ row }) => formatVoucherScope(row.original) },
    { accessorKey: "startDate", header: "Start", cell: ({ row }) => formatDate(row.original.startDate) },
    { accessorKey: "endDate", header: "End", cell: ({ row }) => formatDate(row.original.endDate) },
    {
      id: "status", header: "Status", enableSorting: false,
      cell: ({ row }) => {
        const status = getVoucherStatus(row.original);
        return <span className={`text-xs font-medium ${status === "Active" ? "text-green-600" : "text-muted-foreground"}`}>{status}</span>;
      },
    },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}><PencilIcon className="size-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(row.original)}><Trash2Icon className="size-3.5 text-destructive" /></Button>
        </div>
      ),
    },
  ];
}

export function VouchersTable({ vouchers, isLoading, meta, page, sortBy, sortOrder, onSort, onPageChange, onEdit, onDelete }: Props) {
  const columns = buildColumns(onEdit, onDelete);

  function handleSortChange(field: string, order: "asc" | "desc") {
    if (SORTABLE_FIELDS.has(field)) onSort(field as VoucherSortField, order);
  }

  return (
    <AdminDataTable
      columns={columns}
      data={vouchers}
      isLoading={isLoading}
      emptyMessage="No vouchers found."
      minWidth="min-w-[900px]"
      pagination={{ meta: { ...meta, page }, onPageChange }}
      sorting={{ sortBy, sortOrder, onSortChange: handleSortChange }}
    />
  );
}
