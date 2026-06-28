import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingCartIcon, ShoppingBasketIcon, MapPinIcon, AlertCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart.store"
import { useLocationStore } from "@/store/location.store"
import { usePageTitle } from "@/hooks/usePageTitle"
import { addressService } from "@/features/order/services/address.service"
import { CartItem } from "../components/CartItem"

function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

export function CartPage() {
  usePageTitle("Cart")
  const navigate = useNavigate()
  const { cart, isLoading, fetchCart } = useCartStore()
  const resolvedStoreId = useLocationStore((s) => s.storeId)

  const [hasAddresses, setHasAddresses] = useState<boolean | null>(null)

  useEffect(() => {
    fetchCart(resolvedStoreId ?? undefined)
  }, [fetchCart, resolvedStoreId])

  useEffect(() => {
    const checkAddresses = async () => {
      try {
        const { data } = await addressService.getAddresses()
        setHasAddresses(data.data.length > 0)
      } catch {
        setHasAddresses(true)
      }
    }
    checkAddresses()
  }, [])

  const items = cart?.items ?? []

  const subtotal = items.reduce((sum, item) => {
    const activeDiscount = item.product.discounts[0]
    let unitPrice = item.product.price
    if (activeDiscount?.type === "percentage" && activeDiscount.value) {
      unitPrice = unitPrice - (unitPrice * activeDiscount.value) / 100
    } else if (activeDiscount?.type === "nominal" && activeDiscount.value) {
      unitPrice = Math.max(0, unitPrice - activeDiscount.value)
    }
    return sum + unitPrice * item.quantity
  }, 0)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  // Cek apakah ada item yang quantity-nya melebihi stok toko terdekat.
  // Kalau ada, tombol checkout di-disable sampai user kurangi quantity.
  const hasOverstockedItems =
    resolvedStoreId !== null &&
    items.some((item) => {
      const nearestStock = item.product.stocks.find((s) => s.storeId === resolvedStoreId)?.stock
      return nearestStock !== undefined && item.quantity > nearestStock
    })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent">
          <ShoppingCartIcon className="size-12 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-bold">Your cart is empty</h2>
        <p className="mb-8 text-muted-foreground">
          Start shopping and add products to your cart!
        </p>
        <Button asChild className="h-11 rounded-full px-8">
          <Link to="/products-catalog">Browse products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <ShoppingBasketIcon className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Cart</h1>
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
          {totalItems} item{totalItems > 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Item list */}
        <div className="grid auto-rows-min gap-3 lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.id} item={item} resolvedStoreId={resolvedStoreId} />
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-bold">Order Summary</h2>

            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal ({totalItems} item{totalItems > 1 ? "s" : ""})
                </span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
            </div>

            <div className="my-4 border-t border-border" />

            <div className="mb-5 flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(subtotal)}</span>
            </div>

            {hasAddresses === false ? (
              <>
                <div className="mb-3 flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground">
                  <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span>You need a delivery address before checking out.</span>
                </div>
                <Button asChild className="h-11 w-full rounded-full text-base font-semibold">
                  <Link to="/profile">Add Delivery Address</Link>
                </Button>
              </>
            ) : (
              <>
                {hasOverstockedItems && (
                  <div className="mb-3 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                    <AlertCircleIcon className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      Some items exceed available stock at your nearest store. Please adjust the quantities first.
                    </span>
                  </div>
                )}
                <Button
                  className="h-11 w-full rounded-full text-base font-semibold"
                  disabled={hasOverstockedItems}
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>
              </>
            )}

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Shipping cost and voucher discounts will be calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}