import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "../types/admin.types";

interface ServerPagination {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export type SortOrder = "asc" | "desc";

interface ServerSorting {
  sortBy: string;
  sortOrder: SortOrder;
  onSortChange: (sortBy: string, sortOrder: SortOrder) => void;
}

interface AdminDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage: string;
  isLoading?: boolean;
  loadingMessage?: string;
  minWidth?: string;
  pagination?: ServerPagination;
  sorting?: ServerSorting;
}

export function AdminDataTable<TData, TValue>({
  columns,
  data,
  emptyMessage,
  isLoading = false,
  loadingMessage = "Loading data...",
  minWidth,
  pagination,
  sorting,
}: AdminDataTableProps<TData, TValue>) {
  const paginationState = getPaginationState(pagination?.meta);
  const sortingState = getSortingState(sorting);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: Boolean(pagination),
    manualSorting: Boolean(sorting),
    onPaginationChange: (updater) => {
      if (!pagination) return;
      const next = typeof updater === "function" ? updater(paginationState) : updater;
      pagination.onPageChange(next.pageIndex + 1);
    },
    pageCount: pagination?.meta.totalPages,
    rowCount: pagination?.meta.total,
    state: {
      ...(pagination ? { pagination: paginationState } : {}),
      ...(sorting ? { sorting: sortingState } : {}),
    },
  });

  if (isLoading) {
    return <TableMessage message={loadingMessage} />;
  }

  return (
    <>
      <Table className={cn("text-left", minWidth)}>
        <TableHeader className="bg-muted/60 text-xs text-muted-foreground">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-4 py-2">
                  {header.isPlaceholder ? null : (
                    <TableHeaderContent header={header} sorting={sorting} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pagination ? <TablePagination meta={pagination.meta} table={table} /> : null}
    </>
  );
}

function TableMessage({ message }: { message: string }) {
  return <div className="px-4 py-10 text-center text-sm text-muted-foreground">{message}</div>;
}

function getPaginationState(meta?: PaginationMeta): PaginationState {
  return { pageIndex: Math.max((meta?.page ?? 1) - 1, 0), pageSize: meta?.limit ?? 10 };
}

function getSortingState(sorting?: ServerSorting): SortingState {
  return sorting ? [{ id: sorting.sortBy, desc: sorting.sortOrder === "desc" }] : [];
}

function TableHeaderContent<TData>({ header, sorting }: {
  header: ReturnType<ReturnType<typeof useReactTable<TData>>["getHeaderGroups"]>[number]["headers"][number];
  sorting?: ServerSorting;
}) {
  const content = flexRender(header.column.columnDef.header, header.getContext());
  if (!sorting || !header.column.getCanSort()) return content;

  const isActive = sorting.sortBy === header.column.id;
  const nextOrder: SortOrder = isActive && sorting.sortOrder === "asc" ? "desc" : "asc";

  return (
    <button
      type="button"
      className="flex items-center gap-1 font-medium text-inherit"
      onClick={() => sorting.onSortChange(header.column.id, nextOrder)}
    >
      {content}
      <SortIcon isActive={isActive} order={sorting.sortOrder} />
    </button>
  );
}

function SortIcon({ isActive, order }: { isActive: boolean; order: SortOrder }) {
  if (!isActive) return <ChevronsUpDownIcon className="size-3.5 opacity-50" />;
  return order === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />;
}

function TablePagination<TData>({ meta, table }: {
  meta: PaginationMeta;
  table: ReturnType<typeof useReactTable<TData>>;
}) {
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
      <span className="text-muted-foreground">Page {meta.page} of {meta.totalPages || 1}</span>
      <div className="flex gap-2">
        <Button variant="outline" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Previous</Button>
        <Button variant="outline" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Next</Button>
      </div>
    </div>
  );
}
