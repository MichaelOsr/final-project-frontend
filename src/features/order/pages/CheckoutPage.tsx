import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ShoppingBagIcon, MapPinIcon, TruckIcon, CreditCardIcon,
  BuildingIcon, Loader2Icon, StoreIcon, TagIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart.store"
import { useOrderStore } from "@/store/order.store"
import { useLocationStore } from "@/store/location.store"
import { usePageTitle } from "@/hooks/usePageTitle"
import { formatPrice } from "../utils/order.utils"
import { addressService } from "../services/address.service"
import { shippingService } from "../services/shipping.service"
import { voucherService } from "../services/voucher.service"
import { geocodeService } from "@/features/home/services/geocode.service"
import { VoucherSelector } from "../components/VoucherSelector"
import type { PaymentMethod, UserAddress, ShippingCostItem, PublicVoucher } from "../types/order.types"

const PAYMENT_METHODS: { id: PaymentMethod; label: string; description: string; icon: React.ReactNode }[] = [
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
  },
]

// Kalkulasi potongan voucher — mirrors logika di backend order.service.ts
function calcVoucherDiscount(
  discountType: "percentage" | "nominal",
  value: number,
  amount: number,
  maxDiscount: number | null,
): number {
  const raw = discountType === "percentage"
    ? Math.floor((amount * value) / 100)
    : value
  return maxDiscount !== null ? Math.min(raw, maxDiscount) : raw
}

export function CheckoutPage() {
  usePageTitle("Checkout")
  const navigate = useNavigate()
  const { cart, fetchCart, clear: clearCart } = useCartStore()
  const { createOrder } = useOrderStore()
  const storeId = useLocationStore((s) => s.storeId)

  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null)
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [addressLabel, setAddressLabel] = useState<string | null>(null)

  const [shippingOptions, setShippingOptions] = useState<ShippingCostItem[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingCostItem | null>(null)
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)
  const [shippingOriginStore, setShippingOriginStore] = useState<string>("")

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("manual_transfer")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [vouchers, setVouchers] = useState<PublicVoucher[]>([])
  const [deliveryVouchers, setDeliveryVouchers] = useState<PublicVoucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState<PublicVoucher | null>(null)
  const [selectedDeliveryVoucher, setSelectedDeliveryVoucher] = useState<PublicVoucher | null>(null)
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false)

  // Load alamat default — dipakai untuk addressId order, ditampilkan read-only.
  useEffect(() => {
    fetchCart()
    const loadAddress = async () => {
      try {
        const { data } = await addressService.getAddresses()
        const defaultAddr = data.data.find((a) => a.isDefault) ?? data.data[0]
        if (defaultAddr) setSelectedAddress(defaultAddr)
      } catch {
        toast.error("Gagal memuat alamat")
      } finally {
        setIsLoadingAddresses(false)
      }
    }
    loadAddress()
  }, [fetchCart])

  // Reverse geocode alamat terpilih untuk label yang lebih deskriptif.
  useEffect(() => {
    if (!selectedAddress) return
    const geocode = async () => {
      try {
        const { data } = await geocodeService.getAddress(
          parseFloat(selectedAddress.latitude),
          parseFloat(selectedAddress.longitude),
        )
        if (data.data?.label) setAddressLabel(data.data.label)
      } catch { /* silently fail */ }
    }
    void geocode()
  }, [selectedAddress])

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
    if (selectedAddress) void fetchShippingCost(selectedAddress.id)
  }, [selectedAddress, fetchShippingCost])

  // Fetch voucher untuk toko terdekat setelah storeId tersedia.
  useEffect(() => {
    if (!storeId) return
    const fetchVouchers = async () => {
      setIsLoadingVouchers(true)
      try {
        const { data } = await voucherService.getStoreVouchers(storeId)
        setVouchers(data.data.vouchers)
        setDeliveryVouchers(data.data.deliveryVouchers)
      } catch { /* silently fail — voucher section tetap muncul tapi kosong */ }
      finally { setIsLoadingVouchers(false) }
    }
    void fetchVouchers()
  }, [storeId])

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

  const deliveryFee = selectedShipping?.cost ?? 0
  const voucherDiscount = selectedVoucher
    ? calcVoucherDiscount(selectedVoucher.discountType, selectedVoucher.value, subtotal, selectedVoucher.maxDiscount)
    : 0
  const deliveryDiscount = selectedDeliveryVoucher
    ? calcVoucherDiscount(selectedDeliveryVoucher.discountType, selectedDeliveryVoucher.value, deliveryFee, selectedDeliveryVoucher.maxDiscount)
    : 0
  const finalDeliveryFee = Math.max(0, deliveryFee - deliveryDiscount)
  const total = Math.max(0, subtotal - voucherDiscount) + finalDeliveryFee

  const handlePlaceOrder = async () => {
    if (!cart?.items.length) { toast.error("Cart kamu kosong"); return }
    if (!selectedAddress) { toast.error("Alamat pengiriman tidak tersedia"); return }
    if (!selectedShipping) { toast.error("Pilih metode pengiriman dulu"); return }
    setIsSubmitting(true)
    try {
      const orderId = await createOrder({
        addressId: selectedAddress.id,
        shippingVendor: `${selectedShipping.name} ${selectedShipping.service}`,
        deliveryFee,
        voucherId: selectedVoucher?.id,
        deliveryVoucherId: selectedDeliveryVoucher?.id,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          discountId: item.product.discounts[0]?.id,
        })),
      })
      clearCart()
      toast.success("Pesanan berhasil dibuat!")
      if (selectedPayment === "manual_transfer") {
        navigate(`/payment/manual-transfer/${orderId}`)
      } else {
        navigate(`/payment/midtrans/${orderId}`)
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Gagal membuat pesanan"
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
        <Button onClick={() => navigate("/products-catalog")} className="h-11 rounded-full px-8">
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
        {/* Alamat Pengiriman — read-only, tidak bisa diganti di halaman ini */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <MapPinIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Alamat Pengiriman</h2>
          </div>
          {isLoadingAddresses ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Memuat alamat...
            </div>
          ) : !selectedAddress ? (
            <p className="text-sm text-muted-foreground">
              Kamu belum punya alamat. Tambahkan di halaman profil.
            </p>
          ) : (
            <div className="rounded-lg bg-accent px-4 py-3">
              <p className="text-sm font-medium">{selectedAddress.name}</p>
              {addressLabel ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{addressLabel}</p>
              ) : selectedAddress.notes ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{selectedAddress.notes}</p>
              ) : null}
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
            <p className="text-sm text-muted-foreground">Alamat belum tersedia.</p>
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
                  selectedPayment === method.id ? "border-primary bg-accent" : "border-border hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="mt-0.5 accent-primary"
                  checked={selectedPayment === method.id}
                  onChange={() => setSelectedPayment(method.id)}
                />
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-muted-foreground">{method.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Voucher Belanja */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TagIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Voucher Belanja</h2>
            {selectedVoucher && (
              <span className="ml-auto text-xs font-medium text-primary">
                -{formatPrice(voucherDiscount)}
              </span>
            )}
          </div>
          <VoucherSelector
            vouchers={vouchers}
            selected={selectedVoucher}
            onSelect={setSelectedVoucher}
            relevantAmount={subtotal}
            isLoading={isLoadingVouchers}
          />
        </div>

        {/* Voucher Ongkir */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TruckIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Voucher Ongkir</h2>
            {selectedDeliveryVoucher && (
              <span className="ml-auto text-xs font-medium text-primary">
                -{formatPrice(deliveryDiscount)}
              </span>
            )}
          </div>
          <VoucherSelector
            vouchers={deliveryVouchers}
            selected={selectedDeliveryVoucher}
            onSelect={setSelectedDeliveryVoucher}
            relevantAmount={deliveryFee}
            isLoading={isLoadingVouchers}
          />
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
            {selectedVoucher && (
              <div className="flex justify-between text-primary">
                <span>Voucher ({selectedVoucher.code})</span>
                <span className="font-medium">-{formatPrice(voucherDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Ongkos kirim{selectedShipping && ` (${selectedShipping.name} ${selectedShipping.service})`}
              </span>
              <span className="font-medium">
                {isLoadingShipping ? (
                  <Loader2Icon className="size-3 animate-spin" />
                ) : selectedShipping ? (
                  formatPrice(deliveryFee)
                ) : "-"}
              </span>
            </div>
            {selectedDeliveryVoucher && (
              <div className="flex justify-between text-primary">
                <span>Voucher Ongkir ({selectedDeliveryVoucher.code})</span>
                <span className="font-medium">-{formatPrice(deliveryDiscount)}</span>
              </div>
            )}
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