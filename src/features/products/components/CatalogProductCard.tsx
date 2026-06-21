import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { getMainImage } from "@/lib/product-image";
import { useCartStore } from "@/store/cart.store";
import { useAddToCart } from "@/features/cart/hooks/useAddToCart";
import type { StoreProduct } from "../types/product.types";

interface CatalogProductCardProps {
  product: StoreProduct;
  storeId: string;
}

export function CatalogProductCard({ product, storeId }: CatalogProductCardProps) {
  const { addToCart, isAdding } = useAddToCart();
  const inCart = useCartStore(
    (s) => s.cart?.items.find((item) => item.productId === product.id)?.quantity ?? 0
  );

  const { stock, isAvailable } = product.storeStock;
  const outOfStock = !isAvailable || stock < 1;

  function handleAddToCart() {
    if (inCart >= stock) {
      toast.error(`You already have all ${stock} in stock in your cart`);
      return;
    }
    void addToCart({ productId: product.id, storeId, quantity: 1 });
  }

  return (
    <ProductCard
      name={product.name}
      category={product.category.name}
      price={product.price}
      imageUrl={getMainImage(product.images)}
      to={`/stores/${storeId}/products/${product.slug}`}
      outOfStock={outOfStock}
      isAdding={isAdding}
      inCartCount={inCart}
      onAddToCart={handleAddToCart}
    />
  );
}
