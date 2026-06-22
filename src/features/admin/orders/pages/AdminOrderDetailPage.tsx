import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { usePageTitle } from "@/hooks/usePageTitle"
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError"
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell"
import { adminOrderService } from "../services/adminOrder.service"
import { OrderActionDialog } from "../components/OrderActionDialog"
import { AdminOrderItemsCard } from "../components/AdminOrderItemsCard"
import {
  type ActionType,
  OrderInfoCard,
  PaymentProofCard,
  OrderActionsCard,
  OrderSummaryCard,
  getDialogProps,
} from "../components/AdminOrderDetailCards"
import type { AdminOrderDetail } from "../types/adminOrder.types"

export function AdminOrderDetailPage() {
  usePageTitle("Transaction Detail")
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [action, setAction] = useState<ActionType>(null)
  const [isActing, setIsActing] = useState(false)

  const loadOrder = useCallback(async () => {
    if (!orderId) return
    setIsLoading(true)
    try {
      const res = await adminOrderService.getById(orderId)
      setOrder(res.data.data)
    } catch (error) {
      toast.error(getAdminErrorMessage(error))
      navigate("/admin/orders")
    } finally {
      setIsLoading(false)
    }
  }, [orderId, navigate])

  useEffect(() => { loadOrder() }, [loadOrder])

  async function handleAction() {
    if (!orderId || !action) return
    setIsActing(true)
    try {
      if (action === "approve" || action === "reject") {
        await adminOrderService.confirmPayment(orderId, action)
      } else if (action === "ship") {
        await adminOrderService.shipOrder(orderId)
      } else {
        await adminOrderService.cancelOrder(orderId)
      }
      toast.success("Transaction updated successfully")
      setAction(null)
      loadOrder()
    } catch (error) {
      toast.error(getAdminErrorMessage(error))
    } finally {
      setIsActing(false)
    }
  }

  if (isLoading) {
    return (
      <AdminDashboardShell>
        <p className="py-10 text-center text-sm text-muted-foreground">
          Loading transaction...
        </p>
      </AdminDashboardShell>
    )
  }

  if (!order) return null

  const dialogProps = getDialogProps(action)

  return (
    <AdminDashboardShell>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/orders")}>
          <ArrowLeftIcon className="size-4" />
          Back
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Transaction Detail</h1>
          <p className="font-mono text-xs text-muted-foreground">{order.id}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <OrderInfoCard order={order} />
          <AdminOrderItemsCard items={order.items} />
          {order.paymentProof && <PaymentProofCard proofUrl={order.paymentProof} />}
        </div>
        <div className="space-y-4">
          <OrderActionsCard order={order} onAction={setAction} />
          <OrderSummaryCard order={order} />
        </div>
      </div>

      <OrderActionDialog
        open={action !== null}
        isLoading={isActing}
        title={dialogProps.title}
        description={dialogProps.description}
        actionLabel={dialogProps.actionLabel}
        variant={dialogProps.variant}
        onConfirm={handleAction}
        onOpenChange={(open) => !open && setAction(null)}
      />
    </AdminDashboardShell>
  )
}