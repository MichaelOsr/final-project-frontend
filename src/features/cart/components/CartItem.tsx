import { useState, useEffect, useRef, useCallback } from "react"
import { Trash2Icon, MinusIcon, PlusIcon, AlertCircleIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart.store"
import type { CartItem as CartItemType } from "@/types/cart.types"

interface CartItemProps {
  item: CartItemType
  resolvedStoreId: string | null
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

function getMainImage(images: CartItemType["product"]["images"]): string {
  if (!images.length) return "/placeholder-product.png"
  const sorted = [...images].sort((a, b) => a.position - b.position)
  return sorted[0].image ?? "/placeholder-product.png"
}

function getDiscountedPrice(
  originalPrice: number,
  discounts: CartItemType["product"]["discounts"]
): { finalPrice: number; hasDiscount: boolean; discountLabel: string } {
  const activeDiscount = discounts[0]

  if (!activeDiscount) {
    return { finalPrice: originalPrice, hasDiscount: false, discountLabel: "" }
  }

  if (activeDiscount.type === "percentage" && activeDiscount.value) {
    const finalPrice = originalPrice - (originalPrice * activeDiscount.value) / 100
    return { finalPrice, hasDiscount: true, discountLabel: `-${activeDiscount.value}%` }
  }

  if (activeDiscount.type === "nominal" && activeDiscount.value) {
    const finalPrice = Math.max(0, originalPrice - activeDiscount.value)
    return { finalPrice, hasDiscount: true, discountLabel: `-${formatPrice(activeDiscount.value)}` }
  }

  if (activeDiscount.type === "buyXGetY") {
    return {
      finalPrice: originalPrice,
      hasDiscount: true,
      discountLabel: `Beli ${activeDiscount.buyQuantity} Gratis ${activeDiscount.getQuantity}`,
    }
  }

  return { finalPrice: originalPrice, hasDiscount: false, discountLabel: "" }
}

const DEBOUNCE_MS = 600

export function CartItem({ item, resolvedStoreId }: CartItemProps) {
  const { updateItem, removeItem } = useCartStore()
  const [isRemoving, setIsRemoving] = useState(false)

  const { product, id: cartItemId } = item
  const mainImage = getMainImage(product.images)
  const { finalPrice, hasDiscount, discountLabel } = getDiscountedPrice(
    product.price,
    product.discounts
  )

  // Stok toko terdekat dari session storage — dipakai untuk warning overstocked.
  const nearestStoreStock =
    product.stocks.find((s) => s.storeId === resolvedStoreId)?.stock ?? null

  // Limit tombol + berdasarkan total stok semua toko.
  const maxStock = product.stocks.reduce((sum, s) => sum + s.stock, 0)

  // Warning muncul kalau quantity di cart melebihi stok toko terdekat.
  const isOverstocked = nearestStoreStock !== null && item.quantity > nearestStoreStock

  const [localQty, setLocalQty] = useState(item.quantity)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMounted = useRef(false)

  useEffect(() => {
    setLocalQty(item.quantity)
  }, [item.quantity])

  const syncToBackend = useCallback(
    (qty: number) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(async () => {
        try {
          await updateItem(cartItemId, qty)
        } catch {
          toast.error("Failed to update product quantity")
          setLocalQty(item.quantity)
        }
      }, DEBOUNCE_MS)
    },
    [cartItemId, updateItem, item.quantity]
  )

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    syncToBackend(localQty)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [localQty, syncToBackend])

  const handleDecrease = () => {
    if (localQty <= 1) return
    setLocalQty((prev) => prev - 1)
  }

  const handleIncrease = () => {
    if (localQty >= maxStock) return
    setLocalQty((prev) => prev + 1)
  }

  const handleRemove = async () => {
    if (isRemoving) return
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    setIsRemoving(true)
    try {
      await removeItem(cartItemId)
      toast.success(`${product.name} removed from cart`)
    } catch {
      toast.error("Failed to remove product from cart")
      setIsRemoving(false)
    }
  }

  const lineTotal = finalPrice * localQty

  return (
    <div className={`flex gap-4 rounded-xl border bg-card p-4 ${isOverstocked ? "border-destructive/50" : "border-border"}`}>
      {/* Product image */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = "/placeholder-product.png"
          }}
        />
        {hasDiscount && (
          <span className="absolute left-0 top-0 rounded-br-lg bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {discountLabel}
          </span>
        )}
      </div>

      {/* Product info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
        {(product.brand || product.variant || product.size) && (
          <p className="text-xs text-muted-foreground">
            {[product.brand, product.variant, product.size].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">{formatPrice(finalPrice)}</span>
          {hasDiscount && product.discounts[0]?.type !== "buyXGetY" && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={handleDecrease}
              disabled={localQty <= 1 || isRemoving}
              aria-label="Decrease quantity"
            >
              <MinusIcon className="size-3" />
            </Button>
            <span className="w-6 text-center text-sm font-medium tabular-nums">{localQty}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={handleIncrease}
              disabled={localQty >= maxStock || isRemoving}
              aria-label="Increase quantity"
            >
              <PlusIcon className="size-3" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{formatPrice(lineTotal)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleRemove}
              disabled={isRemoving}
              aria-label={`Remove ${product.name} from cart`}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </div>

        {/* Warning per item kalau stok toko terdekat tidak cukup */}
        {isOverstocked && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircleIcon className="size-3 shrink-0" />
            <span>
              Only {nearestStoreStock} available at your nearest store. Please reduce the quantity.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}