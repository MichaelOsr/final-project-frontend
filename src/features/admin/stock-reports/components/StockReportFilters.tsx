import type { ReactNode } from "react";
import { format, parseISO, startOfMonth, startOfYear, subDays } from "date-fns";
import { RotateCcwIcon, SearchIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/features/admin/shared/components/DatePickerField";
import { useDebouncedSearchParam } from "@/features/admin/shared/hooks/useDebouncedSearchParam";
import { STOCK_MOVEMENT_TYPE_GROUPS } from "@/features/admin/store-dashboard/utils/stockMovement";
import type { StoreOption } from "@/features/admin/shared/types/admin.types";
import type { AdminCategory } from "@/features/admin/categories/types/adminCategory.types";

interface StockReportFiltersProps {
  startDate: string;
  endDate: string;
  type: string;
  categoryId: string;
  // Drives the Reset button's visibility (e.g. a productId drill-down filter
  // set elsewhere should still surface "Reset" even with no other field set).
  hasExtraFilters?: boolean;
  categories: AdminCategory[];
  onChange: (updates: Record<string, string | number>) => void;
  // Optional store selector — only the super admin cross-store view passes these.
  stores?: StoreOption[];
  storeId?: string;
}

const fmt = (date: Date) => format(date, "yyyy-MM-dd");

const PRESETS: { label: string; range: () => [string, string] }[] = [
  { label: "This month", range: () => [fmt(startOfMonth(new Date())), fmt(new Date())] },
  { label: "Last 30 days", range: () => [fmt(subDays(new Date(), 29)), fmt(new Date())] },
  { label: "This year", range: () => [fmt(startOfYear(new Date())), fmt(new Date())] },
];

// Stock report filter bar: optional store, date range (defaults to month-to-date
// on the backend), quick presets, search, movement type, and category.
export function StockReportFilters({
  startDate,
  endDate,
  type,
  categoryId,
  hasExtraFilters = false,
  categories,
  onChange,
  stores,
  storeId,
}: StockReportFiltersProps) {
  const [search, setSearch] = useDebouncedSearchParam("q");
  const hasFilters = Boolean(
    startDate || endDate || type || categoryId || search || hasExtraFilters,
  );

  function reset() {
    setSearch("");
    onChange({ startDate: "", endDate: "", q: "", type: "", categoryId: "", productId: "", page: 1 });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-end gap-3">
        {stores && (
          <FilterField label="Store" className="w-full sm:w-44">
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={storeId ?? ""}
              onChange={(e) => onChange({ storeId: e.target.value, page: 1 })}
            >
              <option value="">All stores</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FilterField>
        )}
        <FilterField label="Start Date">
          <DatePickerField
            value={startDate}
            placeholder="Start date"
            disabled={(date) => date > new Date() || (endDate ? date > parseISO(endDate) : false)}
            onChange={(value) => onChange({ startDate: value, page: 1 })}
          />
        </FilterField>
        <FilterField label="End Date">
          <DatePickerField
            value={endDate}
            placeholder="End date"
            disabled={(date) => date > new Date() || (startDate ? date < parseISO(startDate) : false)}
            onChange={(value) => onChange({ endDate: value, page: 1 })}
          />
        </FilterField>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="h-9 rounded-md border border-input px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => {
                const [s, e] = p.range();
                onChange({ startDate: s, endDate: e, page: 1 });
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <RotateCcwIcon className="size-3.5" />
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:min-w-56 sm:flex-1">
          <Label className="mb-1.5 block text-xs text-muted-foreground">Search Product</Label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-9"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <FilterField label="Type">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={type}
            onChange={(e) => onChange({ type: e.target.value, page: 1 })}
          >
            <option value="">All types</option>
            <optgroup label="Stock In">
              {STOCK_MOVEMENT_TYPE_GROUPS.in.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Stock Out">
              {STOCK_MOVEMENT_TYPE_GROUPS.out.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          </select>
        </FilterField>
        <FilterField label="Category" className="w-full sm:w-44">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={categoryId}
            onChange={(e) => onChange({ categoryId: e.target.value, page: 1 })}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FilterField>
      </div>
    </div>
  );
}

function FilterField({
  label,
  children,
  className = "w-full sm:w-40",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${className} shrink-0`}>
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
