import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ShoppingBagIcon,
  MapPinIcon,
  TruckIcon,
  CreditCardIcon,
  BuildingIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart.store"
import { useOrderStore } from "@/store/order.store"
import { usePageTitle } from "@/hooks/usePageTitle"
import { formatPrice } from "../utils/order.utils"
import type { PaymentMethod } from "../types/order.types"

// Sementara pakai data dummy untuk address dan shipping.
// Nanti diganti dengan state sesungguhnya saat fitur address (Feature 1) sudah merge.
const DUMMY_ADDRESS = {
  id: "replace-with-real-address-id",
  label: "Rumah",
  detail: "Jl. Contoh No. 1, Jakarta Selatan",
}

const SHIPPING_OPTIONS = [
  { vendor: "JNE", label: "JNE Regular", fee: 15000 },
  { vendor: "J&T", label: "J&T Express", fee: 18000 },
  { vendor: "SiCepat", label: "SiCepat BEST", fee: 12000 },
]

// Opsi metode pembayaran — slot Midtrans sudah ada, tinggal aktifkan nanti.
const PAYMENT_METHODS: { id: PaymentMethod; label: string; description: string; icon: React.ReactNode; disabled?: boolean }[] = [
  {
    id: "manual_transfer",
    label: "Transfer Manual",
    description: "Transfer ke rekening kami, lalu upload bukti pembayaran",
    icon: <BuildingIcon className="size-5" />,
  },
  {
    id: "midtrans",
    label: "Bayar via Midtrans",
    description: "Kartu kredit, GoPay, OVO, DANA, dan metode lainnya",
    icon: <CreditCardIcon className="size-5" />,
    disabled: true, // Aktifkan saat sprint Midtrans
  },
]

export function CheckoutPage() {
  usePageTitle("Checkout")
  const navigate = useNavigate()
  const { cart, fetchCart, clear: clearCart } = useCartStore()
  const { createOrder } = useOrderStore()

  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0])
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("manual_transfer")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const items = cart?.items ?? []

  const subtotal = items.reduce((sum, item) => {
    const discount = item.product.discounts[0]
    let unitPrice = item.product.price

    if (discount?.type === "percentage" && discount.value) {
      unitPrice = unitPrice - (unitPrice * discount.value) / 100
    } else if (discount?.type === "nominal" && discount.value) {
      unitPrice = Math.max(0, unitPrice - discount.value)
    }

    return sum + unitPrice * item.quantity
  }, 0)

  const total = subtotal + selectedShipping.fee

  const handlePlaceOrder = async () => {
    if (!cart?.items.length) {
      toast.error("Cart kamu kosong")
      return
    }

    // Validasi: alamat harus sudah ada (nanti connect ke address feature)
    if (DUMMY_ADDRESS.id === "replace-with-real-address-id") {
      toast.error("Kamu belum menambahkan alamat pengiriman")
      return
    }

    setIsSubmitting(true)
    try {
      const orderId = await createOrder({
        addressId: DUMMY_ADDRESS.id,
        shippingVendor: selectedShipping.vendor,
        deliveryFee: selectedShipping.fee,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          discountId: item.product.discounts[0]?.id,
        })),
      })

      // Kosongkan cart di store setelah order berhasil
      clearCart()
      toast.success("Pesanan berhasil dibuat!")
      navigate(`/orders/${orderId}`)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal membuat pesanan"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!items.length) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent">
          <ShoppingBagIcon className="size-12 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-bold">Tidak ada item untuk di-checkout</h2>
        <p className="mb-8 text-muted-foreground">
          Tambahkan produk ke cart dulu sebelum melanjutkan.
        </p>
        <Button
          onClick={() => navigate("/products")}
          className="h-11 rounded-full px-8"
        >
          Mulai belanja
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <ShoppingBagIcon className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid gap-4">
        {/* Section: Alamat Pengiriman */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <MapPinIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Alamat Pengiriman</h2>
          </div>
          {/* Placeholder — nanti diganti komponen address picker dari Feature 1 */}
          <div className="rounded-lg bg-muted px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground">
              {DUMMY_ADDRESS.label}
            </p>
            <p className="text-sm">{DUMMY_ADDRESS.detail}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            * Fitur pilih alamat akan tersedia setelah Feature 1 (address management) merge.
          </p>
        </div>

        {/* Section: Pilih Pengiriman */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TruckIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Metode Pengiriman</h2>
          </div>
          <div className="grid gap-2">
            {SHIPPING_OPTIONS.map((option) => (
              <label
                key={option.vendor}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                  selectedShipping.vendor === option.vendor
                    ? "border-primary bg-accent"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    className="accent-primary"
                    checked={selectedShipping.vendor === option.vendor}
                    onChange={() => setSelectedShipping(option)}
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {formatPrice(option.fee)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Section: Metode Pembayaran */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <CreditCardIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Metode Pembayaran</h2>
          </div>
          <div className="grid gap-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                  method.disabled
                    ? "cursor-not-allowed opacity-50"
                    : selectedPayment === method.id
                    ? "border-primary bg-accent"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="mt-0.5 accent-primary"
                  checked={selectedPayment === method.id}
                  onChange={() => !method.disabled && setSelectedPayment(method.id)}
                  disabled={method.disabled}
                />
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-muted-foreground">{method.icon}</span>
                  <div>
                    <p className="text-sm font-medium">
                      {method.label}
                      {method.disabled && (
                        <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Segera hadir
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Section: Ringkasan Pesanan */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-bold">Ringkasan Pesanan</h2>

          {/* Daftar item */}
          <div className="mb-4 grid gap-2">
            {items.map((item) => {
              const discount = item.product.discounts[0]
              let unitPrice = item.product.price
              if (discount?.type === "percentage" && discount.value) {
                unitPrice = unitPrice - (unitPrice * discount.value) / 100
              } else if (discount?.type === "nominal" && discount.value) {
                unitPrice = Math.max(0, unitPrice - discount.value)
              }

              return (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name}{" "}
                    <span className="font-medium text-foreground">× {item.quantity}</span>
                  </span>
                  <span className="font-medium">{formatPrice(unitPrice * item.quantity)}</span>
                </div>
              )
            })}
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ongkos kirim ({selectedShipping.label})</span>
              <span className="font-medium">{formatPrice(selectedShipping.fee)}</span>
            </div>
          </div>

          <div className="my-4 border-t border-border" />

          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>

        {/* CTA */}
        <Button
          className="h-12 w-full rounded-full text-base font-semibold"
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Memproses..." : "Buat Pesanan"}
        </Button>
      </div>
    </div>
  )
}