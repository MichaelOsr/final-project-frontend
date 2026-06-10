import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { ClipboardListIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOrderStore } from "@/store/order.store"
import { OrderCard } from "../components/OrderCard"
import { usePageTitle } from "@/hooks/usePageTitle"
import type { TransactionStatus } from "../types/order.types"
import { STATUS_LABEL } from "../components/OrderStatusBadge"

// Tab filter status — "all" untuk semua.
const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "waitingPayment", label: STATUS_LABEL.waitingPayment },
  { value: "waitingConfirmation", label: STATUS_LABEL.waitingConfirmation },
  { value: "process", label: STATUS_LABEL.process },
  { value: "onDelivery", label: STATUS_LABEL.onDelivery },
  { value: "confirmed", label: STATUS_LABEL.confirmed },
  { value: "cancel", label: STATUS_LABEL.cancel },
]

export function OrderListPage() {
  usePageTitle("Pesanan Saya")
  const { orders, meta, isLoadingList, fetchOrders, updateOrderStatus } =
    useOrderStore()

  const [activeStatus, setActiveStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const load = useCallback(
    (status: string, page: number) => {
      fetchOrders({
        status: status === "all" ? undefined : status,
        page,
        limit: 10,
      })
    },
    [fetchOrders]
  )

  useEffect(() => {
    load(activeStatus, currentPage)
  }, [activeStatus, currentPage, load])

  const handleTabChange = (status: string) => {
    setActiveStatus(status)
    setCurrentPage(1)
  }

  const handleUpdateStatus = async (orderId: string, status: "cancel" | "confirmed") => {
    const confirmMsg =
      status === "cancel"
        ? "Yakin mau batalkan pesanan ini?"
        : "Konfirmasi bahwa pesanan sudah kamu terima?"
    const successMsg =
      status === "cancel" ? "Pesanan berhasil dibatalkan" : "Pesanan dikonfirmasi, terima kasih!"

    if (!window.confirm(confirmMsg)) return
    setIsUpdating(orderId)
    try {
      await updateOrderStatus(orderId, status)
      toast.success(successMsg)
    } catch {
      toast.error("Gagal mengubah status pesanan")
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <ClipboardListIcon className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Pesanan Saya</h1>
      </div>

      {/* Tab filter status — scrollable di mobile */}
      <div className="mb-6 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeStatus === tab.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoadingList ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent">
            <ClipboardListIcon className="size-10 text-primary" />
          </div>
          <h2 className="mb-2 text-base font-bold">Belum ada pesanan</h2>
          <p className="text-sm text-muted-foreground">
            {activeStatus === "all"
              ? "Kamu belum pernah membuat pesanan."
              : `Tidak ada pesanan dengan status "${STATUS_LABEL[activeStatus as TransactionStatus] ?? activeStatus}".`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
            key={order.id}
            className={
              isUpdating === order.id ? "opacity-60 pointer-events-none" : ""
            }
          >
            <OrderCard
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage <= 1 || isLoadingList || isUpdating !== null}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= meta.totalPages || isLoadingList || isUpdating !== null}
          >
            Berikutnya
          </Button>
        </div>
      )}
    </div>
  )
}