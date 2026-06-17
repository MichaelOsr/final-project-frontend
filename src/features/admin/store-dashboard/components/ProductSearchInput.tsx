import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminProductService } from "@/features/admin/products/services/adminProduct.service";
import type { AdminProduct } from "@/features/admin/products/types/adminProduct.types";

interface Props {
  selected: AdminProduct | null;
  onSelect: (product: AdminProduct) => void;
  onClear: () => void;
}

export function ProductSearchInput({ selected, onSelect, onClear }: Props) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await adminProductService.list({ q: query, limit: 10, page: 1 });
        setProducts(res.data.data ?? []);
      } catch {
        setProducts([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(product: AdminProduct) {
    setQuery("");
    setProducts([]);
    onSelect(product);
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
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9"
      />
      {query.trim() && (isSearching || products.length > 0) && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md">
          {isSearching && <p className="px-3 py-2 text-sm text-muted-foreground">Searching...</p>}
          {!isSearching && products.map((p) => (
            <button
              key={p.id}
              type="button"
              className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => handleSelect(p)}
            >
              <span className="font-medium">{p.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
