import { useProducts } from "@/features/home/hooks/useProducts"
import { ProductCard } from "@/features/home/components/ProductCard"

// Renders the product list for the given store, handling the
// loading / error / empty / success states.
export function ProductGrid({ storeId }: { storeId: string | null }) {
  const { products, isLoading, error } = useProducts(storeId)

  if (isLoading) {
    return <p className="py-10 text-center text-muted-foreground">Loading products…</p>
  }

  if (error) {
    return <p className="py-10 text-center text-destructive">{error}</p>
  }

  if (!products.length) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        No products available at this store yet.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} storeId={storeId} />
      ))}
    </div>
  )
}
