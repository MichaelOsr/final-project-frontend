import { CatalogProductCard } from "./CatalogProductCard";
import type { StoreProduct } from "../types/product.types";

interface CatalogGridProps {
  products: StoreProduct[];
  storeId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function CatalogGrid({ products, storeId, isLoading, error }: CatalogGridProps) {
  if (isLoading) {
    return <p className="py-16 text-center text-muted-foreground">Loading products…</p>;
  }

  if (error) {
    return <p className="py-16 text-center text-destructive">{error}</p>;
  }

  if (!storeId) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Detecting your store location…
      </p>
    );
  }

  if (!products.length) {
    return <p className="py-16 text-center text-muted-foreground">No products match your filters.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <CatalogProductCard key={product.id} product={product} storeId={storeId} />
      ))}
    </div>
  );
}
