import { toast } from "sonner"
import { ProductCard as SharedProductCard } from "@/components/ProductCard"
import { getMainImage } from "@/lib/product-image"
import { useCartStore } from "@/store/cart.store"
import { useAddToCart } from "@/features/cart/hooks/useAddToCart"
import type { StoreProduct } from "@/features/products/types/product.types"

interface ProductCardProps {
  product: StoreProduct
  storeId: string | null
}

export function ProductCard({ product, storeId }: ProductCardProps) {
  const { addToCart, isAdding } = useAddToCart()
  const inCart = useCartStore(
    (s) => s.cart?.items.find((item) => item.productId === product.id)?.quantity ?? 0
  )

  const { stock, isAvailable } = product.storeStock
  const outOfStock = !isAvailable || stock < 1

  function handleAddToCart() {
    if (!storeId) return
    if (inCart >= stock) {
      toast.error(`You already have all ${stock} in stock in your cart`)
      return
    }
    void addToCart({ productId: product.id, storeId, quantity: 1 })
  }

  return (
    <SharedProductCard
      name={product.name}
      category={product.category.name}
      price={product.price}
      imageUrl={getMainImage(product.images)}
      to={storeId ? `/stores/${storeId}/products/${product.slug}` : `/products/${product.slug}`}
      pricePreview={product.pricePreview}
      outOfStock={outOfStock}
      disabled={!storeId}
      isAdding={isAdding}
      inCartCount={inCart}
      onAddToCart={handleAddToCart}
    />
  )
}
