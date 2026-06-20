import type { ColumnDef } from "@tanstack/react-table";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminDataTable } from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import type { Discount, DiscountSortField } from "../types/promo.types";
import { formatDiscountType, formatDiscountValue, formatQuota, isDiscountActive } from "../utils/promoFormat";

const SORTABLE_FIELDS = new Set(["name", "type", "startDate", "endDate", "productName", "createdAt"]);

interface Props {
  discounts: Discount[];
  isLoading: boolean;
  meta: PaginationMeta;
  page: number;
  sortBy: DiscountSortField;
  sortOrder: "asc" | "desc";
  onSort: (field: DiscountSortField, order: "asc" | "desc") => void;
  onPageChange: (page: number) => void;
  onEdit: (discount: Discount) => void;
  onDelete: (discount: Discount) => void;
}

function StatusCell({ discount }: { discount: Discount }) {
  const active = isDiscountActive(discount);
  return (
    <span className={`text-xs font-medium ${active ? "text-green-600" : "text-muted-foreground"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ActionsCell({ discount, onEdit, onDelete }: { discount: Discount; onEdit: (d: Discount) => void; onDelete: (d: Discount) => void }) {
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" onClick={() => onEdit(discount)}>
        <PencilIcon className="size-3.5" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onDelete(discount)}>
        <Trash2Icon className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}

function buildColumns(onEdit: (d: Discount) => void, onDelete: (d: Discount) => void): ColumnDef<Discount>[] {
  return [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "type", header: "Type", cell: ({ row }) => formatDiscountType(row.original.type) },
    { id: "value", header: "Value", enableSorting: false, cell: ({ row }) => formatDiscountValue(row.original) },
    { id: "productName", header: "Product", accessorFn: (row) => row.product?.name, cell: ({ row }) => row.original.product?.name ?? "-" },
    { id: "quota", header: "Used / Quota", enableSorting: false, cell: ({ row }) => <span className="text-xs">{formatQuota(row.original)}</span> },
    { accessorKey: "startDate", header: "Start", cell: ({ row }) => formatDate(row.original.startDate) },
    { accessorKey: "endDate", header: "End", cell: ({ row }) => formatDate(row.original.endDate) },
    { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <StatusCell discount={row.original} /> },
    { id: "actions", header: "", enableSorting: false, cell: ({ row }) => <ActionsCell discount={row.original} onEdit={onEdit} onDelete={onDelete} /> },
  ];
}

export function DiscountsTable({ discounts, isLoading, meta, page, sortBy, sortOrder, onSort, onPageChange, onEdit, onDelete }: Props) {
  const columns = buildColumns(onEdit, onDelete);

  function handleSortChange(field: string, order: "asc" | "desc") {
    if (SORTABLE_FIELDS.has(field)) onSort(field as DiscountSortField, order);
  }

  return (
    <AdminDataTable
      columns={columns}
      data={discounts}
      isLoading={isLoading}
      emptyMessage="No discounts found."
      minWidth="min-w-[760px]"
      pagination={{ meta: { ...meta, page }, onPageChange }}
      sorting={{ sortBy, sortOrder, onSortChange: handleSortChange }}
    />
  );
}
