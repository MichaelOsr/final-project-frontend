import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type { StockTransferRequest, TransferAction, TransferSortField } from "../types/stockTransfer.types";
import {
  TRANSFER_ACTION_LABELS,
  getTransferActions,
  getTransferStatusBadgeClass,
  getTransferStatusLabel,
} from "../utils/stockTransfer";

type SortOrder = "asc" | "desc";

interface TableProps {
  requests: StockTransferRequest[];
  isLoading: boolean;
  meta: PaginationMeta;
  page: number;
  sortBy: TransferSortField;
  sortOrder: SortOrder;
  myStoreId: string;
  onSort: (field: TransferSortField) => void;
  onPageChange: (page: number) => void;
  onView: (request: StockTransferRequest) => void;
  onAction: (request: StockTransferRequest, action: TransferAction) => void;
}

interface SortState {
  sortBy: TransferSortField;
  sortOrder: SortOrder;
  onSort: (field: TransferSortField) => void;
}

function SortableHeader({ label, field, sort }: { label: string; field: TransferSortField; sort: SortState }) {
  const active = sort.sortBy === field;
  const Icon = !active ? ArrowUpDownIcon : sort.sortOrder === "asc" ? ArrowUpIcon : ArrowDownIcon;
  return (
    <th className="px-4 py-3 text-left font-semibold" aria-sort={active ? (sort.sortOrder === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => sort.onSort(field)} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        <Icon className={`size-3.5 ${active ? "text-foreground" : "opacity-40"}`} />
      </button>
    </th>
  );
}

function StatusBadge({ status }: { status: StockTransferRequest["status"] }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getTransferStatusBadgeClass(status)}`}>
      {getTransferStatusLabel(status)}
    </span>
  );
}

function ActionButtons({ request, myStoreId, onView, onAction }: {
  request: StockTransferRequest;
  myStoreId: string;
  onView: (r: StockTransferRequest) => void;
  onAction: (r: StockTransferRequest, a: TransferAction) => void;
}) {
  const actions = getTransferActions(request, myStoreId);
  return (
    <div className="flex items-center gap-1">
      {actions.map((action) => (
        <Button key={action} variant="outline" size="sm" onClick={() => onAction(request, action)}>
          {TRANSFER_ACTION_LABELS[action]}
        </Button>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onView(request)} title="View details">
        <EyeIcon className="size-4" />
      </Button>
    </div>
  );
}

function TransferCard({ request, myStoreId, onView, onAction }: {
  request: StockTransferRequest;
  myStoreId: string;
  onView: (r: StockTransferRequest) => void;
  onAction: (r: StockTransferRequest, a: TransferAction) => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium" title={request.productName}>{request.productName}</p>
          <p className="font-mono text-xs text-muted-foreground">{request.product.sku}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      <div className="text-sm text-muted-foreground">
        <p><span className="font-medium text-foreground">From:</span> {request.fromStore.name}</p>
        <p><span className="font-medium text-foreground">To:</span> {request.toStore.name}</p>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Qty: <span className="font-semibold text-foreground">{request.quantity}</span></span>
        <span className="whitespace-nowrap">{formatDate(request.requestedAt ?? request.createdAt)}</span>
      </div>
      <ActionButtons request={request} myStoreId={myStoreId} onView={onView} onAction={onAction} />
    </div>
  );
}

function Pagination({ page, meta, count, onPageChange }: { page: number; meta: PaginationMeta; count: number; onPageChange: (p: number) => void }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">Showing {count} of {meta.total} entries</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
        <span className="flex items-center px-2 text-xs text-muted-foreground">Page {page} of {meta.totalPages}</span>
        <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

export function TransferRequestsTable({ requests, isLoading, meta, page, sortBy, sortOrder, myStoreId, onSort, onPageChange, onView, onAction }: TableProps) {
  const sort: SortState = { sortBy, sortOrder, onSort };
  const isEmpty = !isLoading && requests.length === 0;

  return (
    <>
      <div className="md:hidden">
        {isLoading && <p className="inline-flex w-full items-center justify-center gap-2 px-4 py-6 text-muted-foreground"><Spinner />Loading...</p>}
        {isEmpty && <p className="px-4 py-6 text-center text-muted-foreground">No transfer requests yet</p>}
        {!isLoading && requests.map((r) => (
          <TransferCard key={r.id} request={r} myStoreId={myStoreId} onView={onView} onAction={onAction} />
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-190 text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <SortableHeader label="Date" field="createdAt" sort={sort} />
              <SortableHeader label="Product" field="productName" sort={sort} />
              <th className="px-4 py-3 text-left font-semibold">From</th>
              <th className="px-4 py-3 text-left font-semibold">To</th>
              <SortableHeader label="Qty" field="quantity" sort={sort} />
              <SortableHeader label="Status" field="status" sort={sort} />
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={7} className="px-4 py-3 text-center text-muted-foreground"><span className="inline-flex items-center justify-center gap-2"><Spinner />Loading...</span></td></tr>}
            {isEmpty && <tr><td colSpan={7} className="px-4 py-3 text-center text-muted-foreground">No transfer requests yet</td></tr>}
            {!isLoading && requests.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(r.requestedAt ?? r.createdAt)}</td>
                <td className="max-w-45 px-4 py-3">
                  <p className="truncate font-medium" title={r.productName}>{r.productName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{r.product.sku}</p>
                </td>
                <td className="max-w-40 truncate px-4 py-3 text-muted-foreground" title={r.fromStore.name}>{r.fromStore.name}</td>
                <td className="max-w-40 truncate px-4 py-3 text-muted-foreground" title={r.toStore.name}>{r.toStore.name}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">{r.quantity}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">
                  <ActionButtons request={r} myStoreId={myStoreId} onView={onView} onAction={onAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!isLoading && requests.length > 0 && (
        <Pagination page={page} meta={meta} count={requests.length} onPageChange={onPageChange} />
      )}
    </>
  );
}
