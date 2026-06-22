import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/format"
import type { AdminOrderItem } from "../types/adminOrder.types"

interface AdminOrderItemsCardProps {
  items: AdminOrderItem[]
}

export function AdminOrderItemsCard({ items }: AdminOrderItemsCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border">
        <CardTitle>Items ({items.length})</CardTitle>
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
    <div className="flex items-start gap-3 p-4">
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
          <p className="text-xs text-green-600">Diskon: {item.discount.name}</p>
        )}
      </div>
      <p className="shrink-0 font-semibold">{formatPrice(item.totalPrice)}</p>
    </div>
  )
}