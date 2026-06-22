import type { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { formatDate, formatNumber } from "@/features/admin/shared/utils/adminFormat";
import type { DiscountReportItem, DiscountReportSummary } from "../types/promo.types";
import { formatRupiah } from "../utils/promoFormat";

interface Props {
  summary: DiscountReportSummary | null;
  items: DiscountReportItem[];
  isLoading: boolean;
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

const columns: ColumnDef<DiscountReportItem>[] = [
  { accessorKey: "discountName", header: "Discount" },
  {
    id: "product",
    header: "Product",
    enableSorting: false,
    cell: ({ row }) => row.original.product?.name ?? "-",
  },
  {
    id: "discountAmount",
    header: "Discount Amount",
    enableSorting: false,
    cell: ({ row }) => formatRupiah(row.original.discountAmount),
  },
  {
    id: "date",
    header: "Date",
    enableSorting: false,
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

function SummaryCards({ summary }: { summary: DiscountReportSummary }) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">Total usage</p>
        <p className="text-2xl font-bold">{formatNumber(summary.totalUsage)}</p>
      </div>
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">Total discount given</p>
        <p className="text-2xl font-bold">{formatRupiah(summary.totalDiscountAmount)}</p>
      </div>
    </div>
  );
}

export function DiscountReportPanel({ summary, items, isLoading, meta, onPageChange }: Props) {
  return (
    <div>
      {summary && <SummaryCards summary={summary} />}
      <AdminDataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        emptyMessage="No discount usage records found."
        pagination={{ meta, onPageChange }}
      />
    </div>
  );
}
