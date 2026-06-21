import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCategories } from "../hooks/useCategories";
import { useDebouncedSearchParam } from "../hooks/useDebouncedSearchParam";
import { updateSearchParams } from "../utils/searchParams";

const DIGITS_ONLY = /^\d*$/;
const SELECT_CLASS =
  "h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface CatalogFiltersProps {
  onApply?: () => void;
}

export function CatalogFilters({ onApply }: CatalogFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const categories = useCategories();
  const [minPrice, setMinPrice] = useDebouncedSearchParam("minPrice");
  const [maxPrice, setMaxPrice] = useDebouncedSearchParam("maxPrice");

  const categoryId = searchParams.get("categoryId") ?? "";
  const inStock = searchParams.get("inStock") === "true";

  function handleCategoryChange(value: string) {
    setSearchParams((prev) => updateSearchParams(prev, { categoryId: value, page: 1 }));
  }

  function handleInStockChange(checked: boolean) {
    setSearchParams((prev) => updateSearchParams(prev, { inStock: checked ? "true" : "", page: 1 }));
  }

  function handlePriceChange(setter: (value: string) => void, value: string) {
    if (DIGITS_ONLY.test(value)) setter(value);
  }

  function handleClear() {
    setSearchParams(new URLSearchParams());
    setMinPrice("");
    setMaxPrice("");
    onApply?.();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Category</Label>
        <select className={SELECT_CLASS} value={categoryId} onChange={(e) => handleCategoryChange(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center justify-between text-sm">
        <span>Available only</span>
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={inStock}
          onChange={(e) => handleInStockChange(e.target.checked)}
        />
      </label>

      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Price range</Label>
        <div className="flex items-center gap-2">
          <Input
            inputMode="numeric"
            className="h-9"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => handlePriceChange(setMinPrice, e.target.value)}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            inputMode="numeric"
            className="h-9"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => handlePriceChange(setMaxPrice, e.target.value)}
          />
        </div>
      </div>

      <Button variant="outline" className="rounded-full" onClick={handleClear}>
        Clear all
      </Button>
    </div>
  );
}
