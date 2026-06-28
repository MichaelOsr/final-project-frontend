import { AlertTriangleIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/format"
import type { AdminOrderItem } from "../types/adminOrder.types"

interface AdminOrderItemsCardProps {
  items: AdminOrderItem[]
}

export function AdminOrderItemsCard({ items }: AdminOrderItemsCardProps) {
  const fulfillmentCount = items.filter((i) => i.requiresFulfillment).length

  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>Items ({items.length})</CardTitle>
          {fulfillmentCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
              <AlertTriangleIcon className="size-3.5" />
              {fulfillmentCount} item{fulfillmentCount > 1 ? "s" : ""} need fulfillment
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {items.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </CardContent>
    </Card>
  )
}

function getItemImage(item: AdminOrderItem): string {
  if (!item.product.images?.length) return "/placeholder-product.png"
  const sorted = [...item.product.images].sort((a, b) => a.position - b.position)
  return sorted[0].image ?? "/placeholder-product.png"
}

function OrderItemRow({ item }: { item: AdminOrderItem }) {
  const imageUrl = getItemImage(item)

  return (
    <div className={`flex items-start gap-3 p-4 ${item.requiresFulfillment ? "bg-orange-50/60" : ""}`}>
      <img
        src={imageUrl}
        alt={item.name}
        className="size-14 shrink-0 rounded-md border border-border object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {item.quantity} × {formatPrice(item.product.price)}
        </p>
        {item.discount && (
          <p className="text-xs text-green-600">Discount: {item.discount.name}</p>
        )}
        {item.requiresFulfillment && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-orange-700">
            <AlertTriangleIcon className="size-3.5 shrink-0" />
            <span>
              Needs fulfillment: {item.shortageQuantity} unit{(item.shortageQuantity ?? 0) > 1 ? "s" : ""} short
              {item.storeStockAtOrder !== null && ` (store had ${item.storeStockAtOrder} at order time)`}
            </span>
          </div>
        )}
      </div>
      <p className="shrink-0 font-semibold">{formatPrice(item.totalPrice)}</p>
    </div>
  )
}