import { ProductCard as SharedProductCard } from "@/components/ProductCard"
import { getMainImage } from "@/lib/product-image"
import { useCartStore } from "@/store/cart.store"
import { useAddToCart } from "@/features/cart/hooks/useAddToCart"
import type { Product } from "@/types/product.types"

interface ProductCardProps {
  product: Product
  storeId: string | null
}

export function ProductCard({ product, storeId }: ProductCardProps) {
  const { addToCart, isAdding } = useAddToCart()
  const inCart = useCartStore(
    (s) => s.cart?.items.find((item) => item.productId === product.id)?.quantity ?? 0
  )

  function handleAddToCart() {
    if (!storeId) return
    void addToCart({ productId: product.id, storeId, quantity: 1 })
  }

  return (
    <SharedProductCard
      name={product.name}
      category={product.category.name}
      price={product.price}
      imageUrl={getMainImage(product.images)}
      to={product.slug ? `/products/${product.slug}` : ""}
      disabled={!storeId}
      isAdding={isAdding}
      inCartCount={inCart}
      onAddToCart={handleAddToCart}
    />
  )
}
