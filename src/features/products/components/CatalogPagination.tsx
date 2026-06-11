import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { updateSearchParams } from "../utils/searchParams";
import type { PaginationMeta } from "@/types/api.types";

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - (sorted[i - 1] as number) > 1) result.push("...");
    result.push(page);
  });
  return result;
}

export function CatalogPagination({ meta }: { meta: PaginationMeta | null }) {
  const [, setSearchParams] = useSearchParams();

  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages } = meta;
  const goTo = (next: number) => setSearchParams((prev) => updateSearchParams(prev, { page: next }));

  return (
    <div className="mt-12 flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)}>
          Prev
        </Button>
        {getPageNumbers(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "ghost"}
              size="icon-sm"
              className="rounded-full"
              onClick={() => goTo(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goTo(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
