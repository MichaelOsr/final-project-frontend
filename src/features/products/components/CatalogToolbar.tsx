import { useSearchParams } from "react-router-dom";
import { updateSearchParams } from "../utils/searchParams";

const SORT_OPTIONS = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const PAGE_SIZE_OPTIONS = [12, 24, 48];

const SELECT_CLASS =
  "h-8 rounded-full border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CatalogToolbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortBy = searchParams.get("sortBy") ?? "price";
  const sortOrder = searchParams.get("sortOrder") ?? "asc";
  const limit = searchParams.get("limit") ?? "12";

  function handleSortChange(value: string) {
    const [nextSortBy, nextSortOrder] = value.split("-");
    setSearchParams((prev) => updateSearchParams(prev, { sortBy: nextSortBy, sortOrder: nextSortOrder, page: 1 }));
  }

  function handleLimitChange(value: string) {
    setSearchParams((prev) => updateSearchParams(prev, { limit: value, page: 1 }));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        Show
        <select className={SELECT_CLASS} value={limit} onChange={(e) => handleLimitChange(e.target.value)}>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        Sort by
        <select className={SELECT_CLASS} value={`${sortBy}-${sortOrder}`} onChange={(e) => handleSortChange(e.target.value)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
