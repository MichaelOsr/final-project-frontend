import type { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { formatDate, formatNumber } from "@/features/admin/shared/utils/adminFormat";
import type { VoucherReportItem, VoucherReportSummary } from "../types/voucher.types";
import { formatRupiah } from "../utils/promoFormat";

interface Props {
  summary: VoucherReportSummary | null;
  items: VoucherReportItem[];
  isLoading: boolean;
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

const columns: ColumnDef<VoucherReportItem>[] = [
  {
    id: "voucherName",
    header: "Transaction Voucher",
    enableSorting: false,
    cell: ({ row }) => row.original.voucherName ?? "-",
  },
  {
    id: "voucherDiscount",
    header: "Transaction Discount",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.voucherDiscountAmount != null
        ? formatRupiah(row.original.voucherDiscountAmount)
        : "-",
  },
  {
    id: "deliveryVoucher",
    header: "Delivery Voucher",
    enableSorting: false,
    cell: ({ row }) => row.original.deliveryVoucherName ?? "-",
  },
  {
    id: "deliveryDiscount",
    header: "Delivery Discount",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.deliveryVoucherAmount != null
        ? formatRupiah(row.original.deliveryVoucherAmount)
        : "-",
  },
  {
    id: "date",
    header: "Date",
    enableSorting: false,
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

function SummaryCards({ summary }: { summary: VoucherReportSummary }) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">Total usage</p>
        <p className="text-2xl font-bold">{formatNumber(summary.totalUsage)}</p>
      </div>
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">Transaction discount</p>
        <p className="text-2xl font-bold">{formatRupiah(summary.totalVoucherDiscountAmount)}</p>
      </div>
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">Delivery discount</p>
        <p className="text-2xl font-bold">{formatRupiah(summary.totalDeliveryVoucherAmount)}</p>
      </div>
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">Total discount given</p>
        <p className="text-2xl font-bold">{formatRupiah(summary.totalDiscountAmount)}</p>
      </div>
    </div>
  );
}

export function VoucherReportPanel({ summary, items, isLoading, meta, onPageChange }: Props) {
  return (
    <div>
      {summary && <SummaryCards summary={summary} />}
      <AdminDataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        emptyMessage="No voucher usage records found."
        pagination={{ meta, onPageChange }}
      />
    </div>
  );
}
