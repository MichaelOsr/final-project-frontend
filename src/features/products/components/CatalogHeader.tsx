import type { PaginationMeta } from "@/types/api.types";

interface CatalogHeaderProps {
  meta: PaginationMeta | null;
  productsCount: number;
}

export function CatalogHeader({ meta, productsCount }: CatalogHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Catalog</h1>
      {meta && (
        <p className="text-sm text-muted-foreground">
          Showing {productsCount} of {meta.total} products
        </p>
      )}
    </div>
  );
}
