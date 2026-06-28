import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeftIcon, StoreIcon, MapPinIcon, TruckIcon,
  ReceiptIcon, CreditCardIcon, BuildingIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOrderStore } from "@/store/order.store"
import { OrderStatusBadge } from "../components/OrderStatusBadge"
import { formatPrice, getMainImage } from "../utils/order.utils"
import { usePageTitle } from "@/hooks/usePageTitle"
import { addressService } from "../services/address.service"
import { geocodeService } from "@/features/home/services/geocode.service"
import type { OrderItem } from "../types/order.types"

export function OrderDetailPage() {
  usePageTitle("Order Details")
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const {
    orderDetail,
    isLoadingDetail,
    fetchOrderDetail,
    updateOrderStatus,
    clearDetail,
  } = useOrderStore()

  useEffect(() => {
    if (orderId) fetchOrderDetail(orderId)
    return () => clearDetail()
  }, [orderId, fetchOrderDetail, clearDetail])

  const [addressLabel, setAddressLabel] = useState<string | null>(null)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)

  useEffect(() => {
    if (!orderDetail?.addressId) return
    setIsLoadingAddress(true)
    const fetchAddressLabel = async () => {
      try {
        const { data } = await addressService.getAddresses()
        const addr = data.data.find((a) => a.id === orderDetail.addressId)
        if (addr) {
          try {
            const { data: geo } = await geocodeService.getAddress(
              parseFloat(addr.latitude),
              parseFloat(addr.longitude),
            )
            setAddressLabel(geo.data?.label ?? addr.notes ?? addr.name)
          } catch {
            setAddressLabel(addr.notes ?? addr.name)
          }
        }
      } catch { /* silently fail */ }
      finally { setIsLoadingAddress(false) }
    }
    fetchAddressLabel()
  }, [orderDetail?.addressId])

  const handleUpdateStatus = async (status: "cancel" | "confirmed") => {
    if (!orderDetail) return
    const confirmMsg =
      status === "cancel"
        ? "Are you sure you want to cancel this order?"
        : "Confirm that you have received this order?"
    if (!window.confirm(confirmMsg)) return
    try {
      await updateOrderStatus(orderDetail.id, status)
      toast.success(
        status === "cancel" ? "Order cancelled successfully" : "Order confirmed, thank you!"
      )
    } catch {
      toast.error("Failed to update order status")
    }
  }

  if (isLoadingDetail) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="grid gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (!orderDetail) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
        <p className="mb-4 text-muted-foreground">Order not found.</p>
        <Button variant="outline" className="rounded-full" onClick={() => navigate("/orders")}>
          Back to orders
        </Button>
      </div>
    )
  }

  const order = orderDetail
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  // Cancel hanya boleh sebelum upload bukti bayar (PRD).
  const isCancellable =
    order.transactionStatus === "waitingPayment"

  const isMidtrans = order.paymentType === "midtrans"

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back + Header */}
      <div className="mb-6">
        <Link
          to="/orders"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          My Orders
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Order Details</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              #{order.id.slice(0, 8).toUpperCase()} · {orderDate}
            </p>
          </div>
          <OrderStatusBadge status={order.transactionStatus} />
        </div>
      </div>

      <div className="grid gap-4">
        {/* Store info */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <StoreIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Store</h2>
          </div>
          <p className="text-sm font-medium">{order.store.name}</p>
          {order.store.address && (
            <p className="mt-0.5 text-xs text-muted-foreground">{order.store.address}</p>
          )}
        </div>

        {/* Products */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <ReceiptIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Products</h2>
          </div>
          <div className="grid gap-3">
            {order.items.map((item: OrderItem) => {
              const mainImage = getMainImage(item.product.images)
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <img
                      src={mainImage}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder-product.png"
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    {item.discount && (
                      <p className="text-xs text-primary">Discount: {item.discount.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} item{item.quantity > 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Shipping */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <TruckIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Shipping</h2>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Courier</span>
            <span className="font-medium">{order.shipping_vendor}</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <MapPinIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Delivery Address</h2>
          </div>
          {isLoadingAddress ? (
            <p className="text-sm text-muted-foreground">Loading address...</p>
          ) : addressLabel ? (
            <p className="text-sm text-foreground">{addressLabel}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Address details are not available.
            </p>
          )}
        </div>

        {/* Price summary */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-bold">Price Summary</h2>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
            {order.voucher && (
              <div className="flex justify-between text-primary">
                <span>Voucher: {order.voucher.name}</span>
                <span>Applied</span>
              </div>
            )}
            {order.deliveryVoucher && (
              <div className="flex justify-between text-primary">
                <span>Shipping voucher: {order.deliveryVoucher.name}</span>
                <span>Applied</span>
              </div>
            )}
          </div>
          <div className="my-4 border-t border-border" />
          <div className="flex items-center justify-between font-bold">
            <span>Total</span>
            <span className="text-base text-primary">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {order.transactionStatus === "waitingPayment" && (
            <>
              <p className="text-center text-xs text-muted-foreground">
                You have 1 hour to complete payment before this order is automatically cancelled.
              </p>
              {isMidtrans ? (
                <Button
                  className="h-11 w-full rounded-full font-semibold"
                  onClick={() => navigate(`/payment/midtrans/${order.id}`)}
                >
                  <CreditCardIcon className="mr-2 size-4" />
                  Pay via Midtrans
                </Button>
              ) : (
                <Button
                  className="h-11 w-full rounded-full font-semibold"
                  onClick={() => navigate(`/payment/manual-transfer/${order.id}`)}
                >
                  <BuildingIcon className="mr-2 size-4" />
                  Upload Transfer Proof
                </Button>
              )}
            </>
          )}

          {order.transactionStatus === "waitingConfirmation" && (
            <div className="rounded-lg bg-blue-50 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-blue-700">Awaiting admin confirmation</p>
              <p className="mt-0.5 text-xs text-blue-600">
                Your payment is being verified by our team.
              </p>
            </div>
          )}

          {isCancellable && (
            <Button
              variant="destructive"
              className="h-11 w-full rounded-full"
              onClick={() => handleUpdateStatus("cancel")}
            >
              Cancel Order
            </Button>
          )}

          {order.transactionStatus === "onDelivery" && (
            <>
              <p className="text-center text-xs text-muted-foreground">
                Order will be automatically confirmed within 2×24 hours if you don't confirm receipt.
              </p>
              <Button
                className="h-11 w-full rounded-full"
                onClick={() => handleUpdateStatus("confirmed")}
              >
                Confirm Order Received
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}