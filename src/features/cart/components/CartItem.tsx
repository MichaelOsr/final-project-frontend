import { useState, useEffect, useRef, useCallback } from "react"
import { Trash2Icon, MinusIcon, PlusIcon } from "lucide-react"
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

  // Stok dari toko terdekat (resolved di CartPage).
  // Fallback ke stok tertinggi di semua toko kalau storeId belum ada.
  const nearestStoreStock =
    product.stocks.find((s) => s.storeId === resolvedStoreId)?.stock ?? null
  const maxStock =
    nearestStoreStock ??
    Math.max(...product.stocks.map((s) => s.stock), 0)

  // State lokal untuk quantity — langsung update saat klik supaya UI responsif.
  const [localQty, setLocalQty] = useState(item.quantity)

  // Ref untuk menyimpan debounce timer.
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref untuk track apakah ini mount pertama — skip kirim ke backend saat init.
  const isMounted = useRef(false)

  // Sync localQty jika prop item.quantity berubah dari luar (misal setelah refetch).
  useEffect(() => {
    setLocalQty(item.quantity)
  }, [item.quantity])

  // Debounced sync ke backend setiap kali localQty berubah.
  const syncToBackend = useCallback(
    (qty: number) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)

      debounceTimer.current = setTimeout(async () => {
        try {
          await updateItem(cartItemId, qty)
        } catch {
          toast.error("Gagal memperbarui jumlah produk")
          // Rollback localQty ke nilai dari store jika gagal.
          setLocalQty(item.quantity)
        }
      }, DEBOUNCE_MS)
    },
    [cartItemId, updateItem, item.quantity]
  )

  // Jalankan sync ke backend setiap localQty berubah, skip saat mount pertama.
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
    // Cancel debounce yang pending sebelum hapus.
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    setIsRemoving(true)
    try {
      await removeItem(cartItemId)
      toast.success(`${product.name} dihapus dari cart`)
    } catch {
      toast.error("Gagal menghapus produk dari cart")
      setIsRemoving(false)
    }
  }

  const lineTotal = finalPrice * localQty

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4">
      {/* Gambar produk */}
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

      {/* Info produk */}
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
              aria-label="Kurangi jumlah"
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
              aria-label="Tambah jumlah"
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
              aria-label={`Hapus ${product.name} dari cart`}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}