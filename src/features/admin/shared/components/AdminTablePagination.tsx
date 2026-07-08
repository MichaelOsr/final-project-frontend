import type { useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "../types/admin.types";

export interface ServerPagination {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  // When provided, renders a "rows per page" selector in the footer.
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export function AdminTablePagination<TData>({
  pagination,
  table,
}: {
  pagination: ServerPagination;
  table: ReturnType<typeof useReactTable<TData>>;
}) {
  const { meta, pageSizeOptions, onPageSizeChange } = pagination;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">
          Page {meta.page} of {meta.totalPages || 1}
        </span>
        {pageSizeOptions && onPageSizeChange && (
          <PageSizeSelect
            value={meta.limit}
            options={pageSizeOptions}
            onChange={onPageSizeChange}
          />
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function PageSizeSelect({
  value,
  options,
  onChange,
}: {
  value: number;
  options: number[];
  onChange: (size: number) => void;
}) {
  return (
    <select
      aria-label="Rows per page"
      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {options.map((n) => (
        <option key={n} value={n}>
          {n} / page
        </option>
      ))}
    </select>
  );
}
