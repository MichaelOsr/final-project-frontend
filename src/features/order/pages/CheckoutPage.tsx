import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ShoppingBagIcon,
  MapPinIcon,
  TruckIcon,
  CreditCardIcon,
  BuildingIcon,
  Loader2Icon,
  StoreIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart.store"
import { useOrderStore } from "@/store/order.store"
import { usePageTitle } from "@/hooks/usePageTitle"
import { formatPrice } from "../utils/order.utils"
import { addressService } from "../services/address.service"
import { shippingService } from "../services/shipping.service"
import { geocodeService } from "@/features/home/services/geocode.service"
import type {
  PaymentMethod,
  UserAddress,
  ShippingCostItem,
} from "../types/order.types"

const PAYMENT_METHODS: {
  id: PaymentMethod
  label: string
  description: string
  icon: React.ReactNode
  disabled?: boolean
}[] = [
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
    disabled: true,
  },
]

export function CheckoutPage() {
  usePageTitle("Checkout")
  const navigate = useNavigate()
  const { cart, fetchCart, clear: clearCart } = useCartStore()
  const { createOrder } = useOrderStore()

  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null)
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)

  const [shippingOptions, setShippingOptions] = useState<ShippingCostItem[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingCostItem | null>(null)
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)
  const [shippingOriginStore, setShippingOriginStore] = useState<string>("")

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("manual_transfer")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Label hasil reverse geocoding per address (cache per id).
  const [addressLabels, setAddressLabels] = useState<Record<string, string>>({})

  // Geocode alamat yang sedang dipilih supaya bisa tampil label lengkap.
  useEffect(() => {
    if (!selectedAddress) return
    if (addressLabels[selectedAddress.id]) return
    const geocode = async () => {
      try {
        const { data } = await geocodeService.getAddress(
          parseFloat(selectedAddress.latitude),
          parseFloat(selectedAddress.longitude),
        )
        if (data.data?.label) {
          setAddressLabels((prev) => ({ ...prev, [selectedAddress.id]: data.data!.label }))
        }
      } catch {
        // Silently fail — label formatnya tidak kritis
      }
    }
    void geocode()
  }, [selectedAddress, addressLabels])

  useEffect(() => {
    fetchCart()
    const loadAddresses = async () => {
      try {
        const { data } = await addressService.getAddresses()
        setAddresses(data.data)
        const defaultAddr = data.data.find((a) => a.isDefault) ?? data.data[0]
        if (defaultAddr) setSelectedAddress(defaultAddr)
      } catch {
        toast.error("Gagal memuat daftar alamat")
      } finally {
        setIsLoadingAddresses(false)
      }
    }
    loadAddresses()
  }, [fetchCart])

  const fetchShippingCost = useCallback(async (addressId: string) => {
    setIsLoadingShipping(true)
    setShippingOptions([])
    setSelectedShipping(null)
    try {
      const { data } = await shippingService.getShippingCost(addressId)
      setShippingOptions(data.data.costs)
      setShippingOriginStore(data.data.origin.store)
      if (data.data.costs.length > 0) setSelectedShipping(data.data.costs[0])
    } catch {
      toast.error("Gagal menghitung ongkos kirim")
    } finally {
      setIsLoadingShipping(false)
    }
  }, [])

  useEffect(() => {
    if (selectedAddress) fetchShippingCost(selectedAddress.id)
  }, [selectedAddress, fetchShippingCost])

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

  const total = subtotal + (selectedShipping?.cost ?? 0)

  const handlePlaceOrder = async () => {
    if (!cart?.items.length) { toast.error("Cart kamu kosong"); return }
    if (!selectedAddress) { toast.error("Pilih alamat pengiriman dulu"); return }
    if (!selectedShipping) { toast.error("Pilih metode pengiriman dulu"); return }

    setIsSubmitting(true)
    try {
      const orderId = await createOrder({
        addressId: selectedAddress.id,
        shippingVendor: `${selectedShipping.name} ${selectedShipping.service}`,
        deliveryFee: selectedShipping.cost,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          discountId: item.product.discounts[0]?.id,
        })),
      })
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
        <p className="mb-8 text-muted-foreground">Tambahkan produk ke cart dulu sebelum melanjutkan.</p>
        <Button onClick={() => navigate("/products")} className="h-11 rounded-full px-8">
          Mulai belanja
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <ShoppingBagIcon className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid gap-4">
        {/* Alamat Pengiriman */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <MapPinIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Alamat Pengiriman</h2>
          </div>
          {isLoadingAddresses ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Memuat alamat...
            </div>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Kamu belum punya alamat pengiriman.</p>
          ) : (
            <div className="grid gap-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    selectedAddress?.id === addr.id
                      ? "border-primary bg-accent"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    className="mt-0.5 accent-primary"
                    checked={selectedAddress?.id === addr.id}
                    onChange={() => setSelectedAddress(addr)}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {addr.name}
                      {addr.isDefault && (
                        <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          Utama
                        </span>
                      )}
                    </p>
                    {addressLabels[addr.id] ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {addressLabels[addr.id]}
                      </p>
                    ) : addr.notes ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{addr.notes}</p>
                    ) : null}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Metode Pengiriman */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TruckIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Metode Pengiriman</h2>
          </div>
          {!selectedAddress ? (
            <p className="text-sm text-muted-foreground">Pilih alamat dulu untuk melihat opsi pengiriman.</p>
          ) : isLoadingShipping ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Menghitung ongkos kirim...
            </div>
          ) : shippingOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada opsi pengiriman tersedia.</p>
          ) : (
            <div className="grid gap-2">
              {shippingOriginStore && (
                <div className="mb-1 flex items-center gap-2 rounded-lg bg-accent px-3 py-2">
                  <StoreIcon className="size-3.5 shrink-0 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Dikirim dari{" "}
                    <span className="font-semibold text-foreground">{shippingOriginStore}</span>
                  </p>
                </div>
              )}
              {shippingOptions.map((option) => (
                <label
                  key={`${option.code}-${option.service}`}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                    selectedShipping?.code === option.code && selectedShipping?.service === option.service
                      ? "border-primary bg-accent"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      className="accent-primary"
                      checked={selectedShipping?.code === option.code && selectedShipping?.service === option.service}
                      onChange={() => setSelectedShipping(option)}
                    />
                    <div>
                      <p className="text-sm font-medium">{option.name} {option.service}</p>
                      <p className="text-xs text-muted-foreground">Estimasi {option.etd} hari</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">{formatPrice(option.cost)}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Metode Pembayaran */}
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

        {/* Ringkasan Pesanan */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-bold">Ringkasan Pesanan</h2>
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
              <span className="text-muted-foreground">
                Ongkos kirim{selectedShipping && ` (${selectedShipping.name} ${selectedShipping.service})`}
              </span>
              <span className="font-medium">
                {isLoadingShipping ? (
                  <Loader2Icon className="size-3 animate-spin" />
                ) : selectedShipping ? (
                  formatPrice(selectedShipping.cost)
                ) : "-"}
              </span>
            </div>
          </div>
          <div className="my-4 border-t border-border" />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>

        <Button
          className="h-12 w-full rounded-full text-base font-semibold"
          onClick={handlePlaceOrder}
          disabled={isSubmitting || isLoadingShipping || !selectedAddress || !selectedShipping}
        >
          {isSubmitting ? "Memproses..." : "Buat Pesanan"}
        </Button>
      </div>
    </div>
  )
}