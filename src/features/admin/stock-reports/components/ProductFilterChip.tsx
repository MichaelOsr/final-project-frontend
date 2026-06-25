import { XIcon } from "lucide-react";

// Active-filter indicator shown when the table is drilled down to one product
// (set from the detail dialog's "View all movements for this product").
export function ProductFilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Filtering by product:</span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground">
        {label || "Selected product"}
        <button
          type="button"
          aria-label="Clear product filter"
          onClick={onClear}
          className="rounded-full hover:opacity-70"
        >
          <XIcon className="size-3.5" />
        </button>
      </span>
    </div>
  );
}
