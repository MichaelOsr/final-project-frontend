import { Link } from "react-router-dom"
import { ChevronRightIcon, StoreIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { formatPrice, getMainImage } from "../utils/order.utils"
import type { OrderSummary } from "../types/order.types"

interface OrderCardProps {
  order: OrderSummary
  onUpdateStatus: (orderId: string, status: "cancel" | "confirmed") => void
}

export function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const firstItem = order.items[0]
  const extraCount = order.items.length - 1
  const mainImage = firstItem
    ? getMainImage(firstItem.product.images)
    : "/placeholder-product.png"

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
      {/* Header: store name + status */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <StoreIcon className="size-3.5 shrink-0" />
          <span className="font-medium">{order.store.name}</span>
        </div>
        <OrderStatusBadge status={order.transactionStatus} />
      </div>

      {/* Tanggal order */}
      <p className="mb-3 text-xs text-muted-foreground">
        {new Date(order.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* Produk preview */}
      <div className="mb-3 flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
          <img
            src={mainImage}
            alt={firstItem?.product.name ?? "Produk"}
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = "/placeholder-product.png"
            }}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {firstItem?.name ?? firstItem?.product.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {firstItem?.quantity} item
            {extraCount > 0 && ` + ${extraCount} produk lainnya`}
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Total pesanan</span>
        <span className="text-sm font-bold text-primary">
          {formatPrice(order.totalPrice)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 rounded-full px-4 text-xs"
        >
          <Link to={`/orders/${order.id}`}>
            Detail <ChevronRightIcon className="size-3" />
          </Link>
        </Button>

        <div className="flex gap-2">
          {order.transactionStatus === "waitingPayment" && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 rounded-full px-4 text-xs"
              onClick={() => onUpdateStatus(order.id, "cancel")}
            >
              Batalkan
            </Button>
          )}
          {order.transactionStatus === "onDelivery" && (
            <Button
              size="sm"
              className="h-8 rounded-full px-4 text-xs"
              onClick={() => onUpdateStatus(order.id, "confirmed")}
            >
              Konfirmasi Diterima
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}