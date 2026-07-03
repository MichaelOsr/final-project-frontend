import type { ReactNode } from "react"
import { CheckIcon, TruckIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/features/admin/shared/utils/adminFormat"
import { OrderStatusBadge } from "@/features/order/components/OrderStatusBadge"
import { formatPrice } from "@/lib/format"
import type { AdminOrderDetail } from "../types/adminOrder.types"

export type ActionType = "approve" | "reject" | "ship" | "cancel" | null

export function OrderInfoCard({ order }: { order: AdminOrderDetail }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border">
        <CardTitle>Transaction Info</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
        <DetailRow label="Status" value={<OrderStatusBadge status={order.transactionStatus} />} />
        <DetailRow label="Date" value={formatDate(order.createdAt)} />
        <DetailRow label="Customer" value={order.customer.name} />
        <DetailRow label="Email" value={order.customer.email} />
        <DetailRow label="Store" value={order.store.name} />
        <DetailRow
          label="Shipping"
          value={`${order.shipping_vendor} · ${formatPrice(order.deliveryFee)}`}
        />
        {order.paymentType && (
          <DetailRow label="Payment Method" value={order.paymentType} />
        )}
      </CardContent>
    </Card>
  )
}

export function PaymentProofCard({ proofUrl }: { proofUrl: string }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border">
        <CardTitle>Payment Proof</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <a href={proofUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={proofUrl}
            alt="Payment proof"
            className="max-h-96 w-full rounded-md border border-border object-contain"
          />
        </a>
        <p className="mt-2 text-xs text-muted-foreground">
          Click image to open in new tab.
        </p>
      </CardContent>
    </Card>
  )
}

export function OrderActionsCard({
  order,
  onAction,
}: {
  order: AdminOrderDetail
  onAction: (action: NonNullable<ActionType>) => void
}) {
  const { transactionStatus: status } = order
  const canApproveOrReject = status === "waitingConfirmation"
  const canShip = status === "process"
  const canCancel = ["waitingPayment", "waitingConfirmation", "paid", "process"].includes(status)

  if (!canApproveOrReject && !canShip && !canCancel) {
    return (
      <Card className="rounded-lg">
        <CardHeader className="border-b border-border">
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            No actions available for this transaction.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border">
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 p-4">
        {canApproveOrReject && (
          <>
            <Button className="w-full" onClick={() => onAction("approve")}>
              <CheckIcon className="size-4" />
              Approve Payment
            </Button>
            <Button variant="outline" className="w-full" onClick={() => onAction("reject")}>
              <XIcon className="size-4" />
              Reject Payment
            </Button>
          </>
        )}
        {canShip && (
          <Button className="w-full" onClick={() => onAction("ship")}>
            <TruckIcon className="size-4" />
            Mark as Shipped
          </Button>
        )}
        {canCancel && (
          <Button variant="destructive" className="w-full" onClick={() => onAction("cancel")}>
            <XIcon className="size-4" />
            Cancel Transaction
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function OrderSummaryCard({ order }: { order: AdminOrderDetail }) {
  const subtotal = order.totalPrice - order.deliveryFee
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border">
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 p-4 text-sm">
        <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
        <SummaryRow label="Delivery" value={formatPrice(order.deliveryFee)} />
        {order.voucher && (
          <SummaryRow label={`Voucher (${order.voucher.name})`} value="-" />
        )}
        <div className="mt-1 border-t border-border pt-2">
          <SummaryRow label="Total" value={formatPrice(order.totalPrice)} bold />
        </div>
      </CardContent>
    </Card>
  )
}

export function getDialogProps(action: ActionType) {
  switch (action) {
    case "approve":
      return {
        title: "Approve Payment?",
        description: "Payment proof confirmed. Order status will change to 'Processing'.",
        actionLabel: "Approve",
        variant: "default" as const,
      }
    case "reject":
      return {
        title: "Reject Payment?",
        description: "Payment rejected. Order status will revert to 'Awaiting Payment'.",
        actionLabel: "Reject",
        variant: "destructive" as const,
      }
    case "ship":
      return {
        title: "Mark as Shipped?",
        description: "Make sure all items are ready to ship. Status will change to 'On Delivery'.",
        actionLabel: "Ship",
        variant: "default" as const,
      }
    case "cancel":
      return {
        title: "Cancel Transaction?",
        description: "Transaction will be cancelled and stock restored. This action cannot be undone.",
        actionLabel: "Cancel Order",
        cancelLabel: "Keep Order",
        variant: "destructive" as const,
      }
    default:
      return { title: "", description: "", actionLabel: "", variant: "default" as const }
  }
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 rounded-lg bg-muted/50 p-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between${bold ? " font-semibold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  )
}