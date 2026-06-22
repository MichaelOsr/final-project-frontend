import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingCartIcon, ShoppingBasketIcon, AlertCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart.store"
import { useLocationStore } from "@/store/location.store"
import { usePageTitle } from "@/hooks/usePageTitle"
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

  // Ambil storeId langsung dari session storage via locationStore.
  // Ini yang paling akurat karena sudah di-resolve saat user di landing page.
  const resolvedStoreId = useLocationStore((s) => s.storeId)

  // Fetch cart setiap kali resolvedStoreId berubah supaya diskon difilter per toko.
  useEffect(() => {
    fetchCart(resolvedStoreId ?? undefined)
  }, [fetchCart, resolvedStoreId])

  const items = cart?.items ?? []

  // Subtotal dihitung dari harga final (setelah diskon percentage/nominal) x qty.
  // Diskon buyXGetY tidak diperhitungkan di sini karena logikanya ada di checkout.
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

  // Cek apakah ada item yang melebihi stok di toko terdekat.
  // Jika iya, tombol checkout di-disable sampai user kurangi quantity.
  const hasOverstockedItems = resolvedStoreId !== null && items.some((item) => {
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
        <h2 className="mb-2 text-xl font-bold">Cart kamu masih kosong</h2>
        <p className="mb-8 text-muted-foreground">
          Yuk, mulai belanja dan tambahkan produk ke cart kamu!
        </p>
        <Button asChild className="h-11 rounded-full px-8">
          <Link to="/products-catalog">Mulai belanja</Link>
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
          {totalItems} item
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Daftar item */}
        <div className="grid auto-rows-min gap-3 lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.id} item={item} resolvedStoreId={resolvedStoreId} />
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-bold">Ringkasan Pesanan</h2>

            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({totalItems} item)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ongkos kirim</span>
                <span className="text-muted-foreground">Dihitung saat checkout</span>
              </div>
            </div>

            <div className="my-4 border-t border-border" />

            <div className="mb-5 flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(subtotal)}</span>
            </div>

            {hasOverstockedItems && (
              <div className="mb-3 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircleIcon className="mt-0.5 size-3.5 shrink-0" />
                <span>Sesuaikan stok item yang melebihi ketersediaan toko terdekat.</span>
              </div>
            )}

            <Button
              className="h-11 w-full rounded-full text-base font-semibold"
              disabled={hasOverstockedItems}
              onClick={() => navigate("/checkout")}
            >
              Lanjut ke Checkout
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Ongkos kirim dan diskon voucher akan dihitung di halaman checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}