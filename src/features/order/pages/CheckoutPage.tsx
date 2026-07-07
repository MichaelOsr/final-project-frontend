import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ShoppingBagIcon, MapPinIcon, TruckIcon, CreditCardIcon,
  BuildingIcon, Loader2Icon, TagIcon, CheckCircle2Icon, PlusIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useCartStore } from "@/store/cart.store"
import { useOrderStore } from "@/store/order.store"
import { useLocationStore } from "@/store/location.store"
import { usePageTitle } from "@/hooks/usePageTitle"
import { formatPrice, calcItemTotal } from "../utils/order.utils"
import { addressService } from "../services/address.service"
import { shippingService } from "../services/shipping.service"
import { voucherService } from "../services/voucher.service"
import { geocodeService } from "@/features/home/services/geocode.service"
import { VoucherSelector } from "../components/VoucherSelector"
import { ShippingSelector } from "../components/ShippingSelector"
import type { PaymentMethod, UserAddress, ShippingCostItem, PublicVoucher } from "../types/order.types"

const PAYMENT_METHODS: { id: PaymentMethod; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "manual_transfer",
    label: "Manual Transfer",
    description: "Transfer to our bank account, then upload proof of payment",
    icon: <BuildingIcon className="size-5" />,
  },
  {
    id: "midtrans",
    label: "Pay via Midtrans",
    description: "Credit card, GoPay, OVO, DANA, and other methods",
    icon: <CreditCardIcon className="size-5" />,
  },
]

// Calculate voucher discount — mirrors backend order.service.ts logic
function calcVoucherDiscount(
  discountType: "percentage" | "nominal",
  value: number,
  amount: number,
  maxDiscount: number | null,
): number {
  const raw = discountType === "percentage"
    ? Math.floor((amount * value) / 100)
    : value
  const capped = maxDiscount !== null ? Math.min(raw, maxDiscount) : raw
  // Discount cannot exceed the amount itself (mirror backend).
  return Math.min(capped, amount)
}

export function CheckoutPage() {
  usePageTitle("Checkout")
  const navigate = useNavigate()
  const { cart, fetchCart, clear: clearCart } = useCartStore()
  const { createOrder } = useOrderStore()
  const storeId = useLocationStore((s) => s.storeId)

  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null)
  const [allAddresses, setAllAddresses] = useState<UserAddress[]>([])
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [addressLabel, setAddressLabel] = useState<string | null>(null)

  const [shippingOptions, setShippingOptions] = useState<ShippingCostItem[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingCostItem | null>(null)
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)
  const [shippingOriginStore, setShippingOriginStore] = useState<string>("")
  const [shippingOriginStoreId, setShippingOriginStoreId] = useState<string | null>(null)

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("manual_transfer")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [vouchers, setVouchers] = useState<PublicVoucher[]>([])
  const [deliveryVouchers, setDeliveryVouchers] = useState<PublicVoucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState<PublicVoucher | null>(null)
  const [selectedDeliveryVoucher, setSelectedDeliveryVoucher] = useState<PublicVoucher | null>(null)
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false)

  // Load addresses — default pre-selected, all kept for the change modal.
  useEffect(() => {
    const loadAddress = async () => {
      try {
        const { data } = await addressService.getAddresses()
        setAllAddresses(data.data)
        const defaultAddr = data.data.find((a) => a.isDefault) ?? data.data[0]
        if (defaultAddr) setSelectedAddress(defaultAddr)
      } catch {
        toast.error("Failed to load address")
      } finally {
        setIsLoadingAddresses(false)
      }
    }
    loadAddress()
  }, [])

  // Always fetch cart with active storeId — product discounts are store-scoped,
  // so without storeId the preview could use discounts from other stores.
  useEffect(() => {
    if (!storeId) return
    void fetchCart(storeId)
  }, [storeId, fetchCart])

  // Reverse geocode selected address for a more descriptive label.
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
    setShippingOriginStoreId(null)
    try {
      const { data } = await shippingService.getShippingCost(addressId)
      setShippingOptions(data.data.costs)
      setShippingOriginStore(data.data.origin.store)
      setShippingOriginStoreId(data.data.origin.storeId)
      if (data.data.costs.length > 0) setSelectedShipping(data.data.costs[0])
    } catch {
      toast.error("Failed to calculate shipping cost")
    } finally {
      setIsLoadingShipping(false)
    }
  }, [])

  useEffect(() => {
    // Intentional data fetch on address change; loading flag set inside callback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selectedAddress) void fetchShippingCost(selectedAddress.id)
  }, [selectedAddress, fetchShippingCost])

  // Fetch vouchers for active store — used when storeId changes & when refreshing
  // after order failure.
  const fetchVouchers = useCallback(async () => {
    if (!storeId) return
    setIsLoadingVouchers(true)
    try {
      const [storeRes, userRes] = await Promise.allSettled([
        voucherService.getStoreVouchers(storeId),
        voucherService.getUserVouchers(),
      ])

      const publicVouchers = storeRes.status === "fulfilled" ? storeRes.value.data.data.vouchers : []
      const publicDelivery = storeRes.status === "fulfilled" ? storeRes.value.data.data.deliveryVouchers : []

      const personal: PublicVoucher[] = userRes.status === "fulfilled"
        ? userRes.value.data.data.map((uv) => ({
            id: uv.voucher.id,
            name: uv.voucher.name,
            code: uv.voucher.code,
            quantity: 1,
            storeId: null,
            minimumTransaction: uv.voucher.minimumTransaction,
            maxDiscount: null,
            discountType: uv.voucher.discountType,
            voucherType: uv.voucher.voucherType,
            value: uv.voucher.value,
            startDate: "",
            endDate: uv.expiresAt ?? "",
            scope: "personal" as const,
          }))
        : []

      const personalTx = personal.filter((v) => v.voucherType === "transaction")
      const personalDelivery = personal.filter((v) => v.voucherType === "delivery")

      setVouchers([...publicVouchers, ...personalTx])
      setDeliveryVouchers([...publicDelivery, ...personalDelivery])
    } catch { /* silently fail — voucher section still appears but empty */ }
    finally { setIsLoadingVouchers(false) }
  }, [storeId])

  useEffect(() => {
    // Intentional data fetch on storeId change; loading flag set di dalam callback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchVouchers()
  }, [fetchVouchers])

  const items = cart?.items ?? []

  // Subtotal pakai calcItemTotal supaya semua tipe discount (termasuk buyXGetY)
  // dihitung sama persis dengan backend.
  const subtotal = items.reduce((sum, item) => sum + calcItemTotal(item), 0)

  const deliveryFee = selectedShipping?.cost ?? 0

  // Changing shipping option can lower deliveryFee below the minimum of the
  // selected delivery voucher. Deselect here so preview doesn't show a discount
  // that will be rejected by the backend. (Subtotal only changes on cart refetch,
  // which already resets vouchers, so transaction voucher doesn't need a guard.)
  const handleSelectShipping = (option: ShippingCostItem) => {
    setSelectedShipping(option)
    if (
      selectedDeliveryVoucher?.minimumTransaction != null &&
      option.cost < selectedDeliveryVoucher.minimumTransaction
    ) {
      setSelectedDeliveryVoucher(null)
    }
  }

  const voucherDiscount = selectedVoucher
    ? calcVoucherDiscount(selectedVoucher.discountType, selectedVoucher.value, subtotal, selectedVoucher.maxDiscount)
    : 0
  const deliveryDiscount = selectedDeliveryVoucher
    ? calcVoucherDiscount(selectedDeliveryVoucher.discountType, selectedDeliveryVoucher.value, deliveryFee, selectedDeliveryVoucher.maxDiscount)
    : 0
  const finalDeliveryFee = Math.max(0, deliveryFee - deliveryDiscount)
  const total = Math.max(0, subtotal - voucherDiscount) + finalDeliveryFee

  const handlePlaceOrder = async () => {
    const orderStoreId = shippingOriginStoreId ?? storeId
    if (!orderStoreId) { toast.error("Store location not ready, please refresh the page"); return }
    if (!cart?.items.length) { toast.error("Your cart is empty"); return }
    if (!selectedAddress) { toast.error("Shipping address not available"); return }
    if (!selectedShipping) { toast.error("Please select a shipping method"); return }
    setIsSubmitting(true)
    try {
      const orderId = await createOrder({
        storeId: orderStoreId,
        addressId: selectedAddress.id,
        shippingVendor: `${selectedShipping.name} ${selectedShipping.service}`,
        deliveryFee,
        voucherId: selectedVoucher?.id,
        deliveryVoucherId: selectedDeliveryVoucher?.id,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          discountId: orderStoreId === storeId
            ? item.product.discounts[0]?.id
            : undefined,
        })),
      })
      clearCart()
      toast.success("Order created successfully!")
      if (selectedPayment === "manual_transfer") {
        navigate(`/payment/manual-transfer/${orderId}`)
      } else {
        navigate(`/payment/midtrans/${orderId}`)
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to create order"
      toast.error(message)
      // State might be stale (stock/discount/voucher changed). Refresh data for the same
      // store & reset selected vouchers so user picks from updated data.
      void fetchCart(storeId ?? "")
      void fetchVouchers()
      setSelectedVoucher(null)
      setSelectedDeliveryVoucher(null)
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
        <h2 className="mb-2 text-xl font-bold">No items to checkout</h2>
        <p className="mb-8 text-muted-foreground">Add products to your cart before proceeding.</p>
        <Button onClick={() => navigate("/products-catalog")} className="h-11 rounded-full px-8">
          Start shopping
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
        {/* Shipping Address */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <MapPinIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Shipping Address</h2>
            {!isLoadingAddresses && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto h-7 rounded-full px-3 text-xs"
                onClick={() => setIsAddressModalOpen(true)}
              >
                Change
              </Button>
            )}
          </div>
          {isLoadingAddresses ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Loading address...
            </div>
          ) : !selectedAddress ? (
            <p className="text-sm text-muted-foreground">
              You don't have an address yet. Add one in your profile.
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

        {/* Address Selection Modal */}
        <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Shipping Address</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 pt-1">
              {allAddresses.map((addr) => {
                const isSelected = addr.id === selectedAddress?.id
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => {
                      setSelectedAddress(addr)
                      setAddressLabel(null)
                      setIsAddressModalOpen(false)
                    }}
                    className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-accent"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{addr.name}</p>
                      {addr.notes && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{addr.notes}</p>
                      )}
                      {addr.isDefault && (
                        <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Default
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    )}
                  </button>
                )
              })}
              <div className="mt-1 border-t border-border pt-3">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setIsAddressModalOpen(false)
                    navigate("/profile?tab=address")
                  }}
                >
                  <PlusIcon className="size-4" />
                  Add New Address
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Shipping Method */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TruckIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Shipping Method</h2>
          </div>
          <ShippingSelector
            options={shippingOptions}
            selected={selectedShipping}
            onSelect={handleSelectShipping}
            isLoading={isLoadingShipping}
            originStore={shippingOriginStore}
            hasAddress={!!selectedAddress}
          />
        </div>

        {/* Payment Method */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <CreditCardIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Payment Method</h2>
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

        {/* Transaction Voucher */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TagIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Transaction Voucher</h2>
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

        {/* Delivery Voucher */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TruckIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Delivery Voucher</h2>
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

        {/* Order Summary */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-bold">Order Summary</h2>
          <div className="mb-4 grid gap-2">
            {items.map((item) => {
              const discount = item.product.discounts[0]
              const lineTotal = calcItemTotal(item)
              const baseTotal = item.product.price * item.quantity
              const isBuyXGetY = discount?.type === "buyXGetY"
              return (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name}{" "}
                    <span className="font-medium text-foreground">× {item.quantity}</span>
                    {isBuyXGetY && (
                      <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        Buy {discount.buyQuantity ?? 1} Get {discount.getQuantity ?? 1}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    {lineTotal < baseTotal && (
                      <span className="text-xs font-normal text-muted-foreground line-through">
                        {formatPrice(baseTotal)}
                      </span>
                    )}
                    {formatPrice(lineTotal)}
                  </span>
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
                Shipping{selectedShipping && ` (${selectedShipping.name} ${selectedShipping.service})`}
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
                <span>Delivery Voucher ({selectedDeliveryVoucher.code})</span>
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
          {isSubmitting ? "Processing..." : "Place Order"}
        </Button>
      </div>
    </div>
  )
}