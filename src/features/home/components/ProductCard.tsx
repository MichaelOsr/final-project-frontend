import { Link } from "react-router-dom"
import { ShoppingCartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/types/product.types"

const PLACEHOLDER_IMAGE = "/placeholder-product.png"

// Picks the first image by position; falls back to a placeholder.
function getMainImage(images: Product["images"]): string {
  if (!images.length) return PLACEHOLDER_IMAGE
  const sorted = [...images].sort((a, b) => a.position - b.position)
  return sorted[0].image ?? PLACEHOLDER_IMAGE
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group grid content-between gap-3 rounded-xl border bg-white p-3 transition-shadow hover:shadow-md">
      {/* Image + details navigate to the product page. The Add-to-cart button is
          kept OUTSIDE this Link so it doesn't trigger navigation. */}
      <Link
        to={product.slug ? `/products/${product.slug}` : "#"}
        className="grid gap-3"
      >
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <img
            src={getMainImage(product.images)}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="grid gap-1">
          <p className="text-xs text-muted-foreground">{product.category.name}</p>
          <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
          <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
        </div>
      </Link>

      {/* UI only — add-to-cart logic will be implemented by a teammate. */}
      <Button className="w-full rounded-full" size="sm">
        <ShoppingCartIcon /> Add to cart
      </Button>
    </div>
  )
}
