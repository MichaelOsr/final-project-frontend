import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storeDashboardService } from "@/features/admin/store-dashboard/services/storeDashboard.service";

export interface StockProductOption {
  productId: string;
  name: string;
  sku: string;
}

interface Props {
  storeId: string;
  selected: StockProductOption | null;
  onSelect: (option: StockProductOption) => void;
  onClear: () => void;
}

export function StockSearchInput({ storeId, selected, onSelect, onClear }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockProductOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim() || !storeId) return;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await storeDashboardService.getStocks(storeId, { q: query.trim(), limit: 10, page: 1 });
        setResults(
          (res.data.data ?? []).map((s) => ({
            productId: s.productId,
            name: s.product.name,
            sku: s.product.sku,
          })),
        );
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, storeId]);

  function handleSelect(option: StockProductOption) {
    setQuery("");
    setResults([]);
    onSelect(option);
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
        <div>
          <p className="font-medium">{selected.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{selected.sku}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>Change</Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search products in this store..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9"
      />
      {query.trim() && (isSearching || results.length > 0) && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md">
          {isSearching && <p className="px-3 py-2 text-sm text-muted-foreground">Searching...</p>}
          {!isSearching && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">No products found in this store.</p>
          )}
          {!isSearching && results.map((r) => (
            <button
              key={r.productId}
              type="button"
              className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => handleSelect(r)}
            >
              <span className="font-medium">{r.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{r.sku}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
