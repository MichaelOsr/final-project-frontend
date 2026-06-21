import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/features/admin/shared/utils/adminFormat";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { getMovementBadgeClass, getMovementDirection, getMovementLabel } from "../utils/stockMovement";
import type { SortOrder, StockMovement, StockMovementSortField } from "../types/stockMovement.types";

interface StockHistoryTableProps {
  movements: StockMovement[];
  isLoading: boolean;
  meta: PaginationMeta;
  page: number;
  sortBy: StockMovementSortField;
  sortOrder: SortOrder;
  onSort: (field: StockMovementSortField) => void;
  onPageChange: (page: number) => void;
  onView: (movement: StockMovement) => void;
  showProduct?: boolean;
}

interface SortState {
  sortBy: StockMovementSortField;
  sortOrder: SortOrder;
  onSort: (field: StockMovementSortField) => void;
}

function SortableHeader({ label, field, align = "left", sort }: { label: string; field: StockMovementSortField; align?: "left" | "center"; sort: SortState }) {
  const active = sort.sortBy === field;
  const Icon = !active ? ArrowUpDownIcon : sort.sortOrder === "asc" ? ArrowUpIcon : ArrowDownIcon;
  return (
    <th className={`px-4 py-3 font-semibold ${align === "center" ? "text-center" : "text-left"}`} aria-sort={active ? (sort.sortOrder === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => sort.onSort(field)}
        className={`inline-flex items-center gap-1 hover:text-foreground ${align === "center" ? "justify-center" : ""}`}
      >
        {label}
        <Icon className={`size-3.5 ${active ? "text-foreground" : "opacity-40"}`} />
      </button>
    </th>
  );
}

interface RowProps {
  movement: StockMovement;
  showProduct: boolean;
  onView: (movement: StockMovement) => void;
}

function TypeBadge({ type }: { type: StockMovement["type"] }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getMovementBadgeClass(type)}`}>
      {getMovementLabel(type)}
    </span>
  );
}

function Quantity({ movement }: { movement: StockMovement }) {
  const isIncrease = getMovementDirection(movement.type) === "in";
  if (movement.quantity === null) return <span className="text-muted-foreground">-</span>;
  return (
    <span className={`font-semibold ${isIncrease ? "text-green-700" : "text-red-700"}`}>
      {isIncrease ? "+" : "-"}{movement.quantity}
    </span>
  );
}

function AdminCell({ movement }: { movement: StockMovement }) {
  return (
    <span className="flex items-center gap-2">
      <Avatar size="sm"><AvatarFallback>{getInitials(movement.admin?.name ?? "System")}</AvatarFallback></Avatar>
      {movement.admin?.name ?? "System"}
    </span>
  );
}

function MovementRow({ movement, showProduct, onView }: RowProps) {
  return (
    <tr className="hover:bg-muted/30">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(movement.createdAt)}</td>
      {showProduct && (
        <td className="max-w-55 px-4 py-3">
          <p className="truncate font-medium" title={movement.name}>{movement.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{movement.product.sku}</p>
        </td>
      )}
      <td className="px-4 py-3"><TypeBadge type={movement.type} /></td>
      <td className="whitespace-nowrap px-4 py-3 text-center font-medium"><Quantity movement={movement} /></td>
      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-muted-foreground">
        {movement.stockBefore ?? "-"} &rarr; {movement.stockAfter ?? "-"}
      </td>
      <td className="px-4 py-3 text-sm"><AdminCell movement={movement} /></td>
      <td className="max-w-45 truncate px-4 py-3 text-sm text-muted-foreground" title={movement.notes ?? ""}>{movement.notes || "-"}</td>
      <td className="px-4 py-3 text-center">
        <Button variant="ghost" size="sm" onClick={() => onView(movement)} title="View details"><EyeIcon className="size-4" /></Button>
      </td>
    </tr>
  );
}

function MovementCard({ movement, showProduct, onView }: RowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-border p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {showProduct && <p className="truncate font-medium">{movement.name}</p>}
          <p className="font-mono text-xs text-muted-foreground">{movement.product.sku}</p>
        </div>
        <Button variant="ghost" size="sm" className="-mr-2 -mt-1 shrink-0" onClick={() => onView(movement)} title="View details">
          <EyeIcon className="size-4" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <TypeBadge type={movement.type} />
        <Quantity movement={movement} />
        <span className="text-xs text-muted-foreground">{movement.stockBefore ?? "-"} &rarr; {movement.stockAfter ?? "-"}</span>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <AdminCell movement={movement} />
        <span className="whitespace-nowrap">{formatDate(movement.createdAt)}</span>
      </div>
      {movement.notes && <p className="text-xs text-muted-foreground">{movement.notes}</p>}
    </div>
  );
}

function Pagination({ page, meta, count, onPageChange }: { page: number; meta: PaginationMeta; count: number; onPageChange: (page: number) => void }) {
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

export function StockHistoryTable({ movements, isLoading, meta, page, sortBy, sortOrder, onSort, onPageChange, onView, showProduct = false }: StockHistoryTableProps) {
  const colSpan = showProduct ? 8 : 7;
  const isEmpty = !isLoading && movements.length === 0;
  const sort: SortState = { sortBy, sortOrder, onSort };
  return (
    <>
      <div className="md:hidden">
        {isLoading && <p className="inline-flex w-full items-center justify-center gap-2 px-4 py-6 text-muted-foreground"><Spinner />Loading...</p>}
        {isEmpty && <p className="px-4 py-6 text-center text-muted-foreground">No stock history yet</p>}
        {!isLoading && movements.map((movement) => (
          <MovementCard key={movement.id} movement={movement} showProduct={showProduct} onView={onView} />
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-190 text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <SortableHeader label="Date" field="createdAt" sort={sort} />
              {showProduct && <SortableHeader label="Product" field="name" sort={sort} />}
              <SortableHeader label="Type" field="type" sort={sort} />
              <SortableHeader label="Qty" field="quantity" align="center" sort={sort} />
              <SortableHeader label="Stock" field="stockAfter" align="center" sort={sort} />
              <SortableHeader label="Admin" field="adminName" sort={sort} />
              <th className="px-4 py-3 text-left font-semibold">Notes</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={colSpan} className="px-4 py-3 text-center text-muted-foreground"><span className="inline-flex items-center justify-center gap-2"><Spinner />Loading...</span></td></tr>}
            {isEmpty && <tr><td colSpan={colSpan} className="px-4 py-3 text-center text-muted-foreground">No stock history yet</td></tr>}
            {!isLoading && movements.map((movement) => (
              <MovementRow key={movement.id} movement={movement} showProduct={showProduct} onView={onView} />
            ))}
          </tbody>
        </table>
      </div>
      {!isLoading && movements.length > 0 && <Pagination page={page} meta={meta} count={movements.length} onPageChange={onPageChange} />}
    </>
  );
}
