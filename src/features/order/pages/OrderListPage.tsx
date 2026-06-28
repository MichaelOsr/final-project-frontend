import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { ClipboardListIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useOrderStore } from "@/store/order.store"
import { OrderCard } from "../components/OrderCard"
import { usePageTitle } from "@/hooks/usePageTitle"
import type { TransactionStatus } from "../types/order.types"
import { STATUS_LABEL } from "../components/OrderStatusBadge"

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "waitingPayment",      label: STATUS_LABEL.waitingPayment      },
  { value: "waitingConfirmation", label: STATUS_LABEL.waitingConfirmation },
  { value: "process",             label: STATUS_LABEL.process             },
  { value: "onDelivery",          label: STATUS_LABEL.onDelivery          },
  { value: "confirmed",           label: STATUS_LABEL.confirmed           },
  { value: "cancel",              label: STATUS_LABEL.cancel              },
]

export function OrderListPage() {
  usePageTitle("My Orders")
  const { orders, meta, isLoadingList, fetchOrders, updateOrderStatus } =
    useOrderStore()

  const [activeStatus, setActiveStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Search + date filter state
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Debounce search input 500ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Reset ke page 1 kalau filter berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, startDate, endDate])

  const load = useCallback(
    (status: string, page: number) => {
      fetchOrders({
        status: status === "all" ? undefined : status,
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
    },
    [fetchOrders, debouncedSearch, startDate, endDate]
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
        ? "Are you sure you want to cancel this order?"
        : "Confirm that you have received this order?"
    const successMsg =
      status === "cancel" ? "Order cancelled successfully" : "Order confirmed, thank you!"

    if (!window.confirm(confirmMsg)) return
    setIsUpdating(orderId)
    try {
      await updateOrderStatus(orderId, status)
      toast.success(successMsg)
    } catch {
      toast.error("Failed to update order status")
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <ClipboardListIcon className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>

      {/* Search + date filter */}
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID..."
            className="h-9 pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Input
          type="date"
          className="h-9"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          type="date"
          className="h-9"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Status filter tabs — scrollable on mobile */}
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
          <h2 className="mb-2 text-base font-bold">No orders found</h2>
          <p className="text-sm text-muted-foreground">
            {activeStatus === "all" && !debouncedSearch && !startDate && !endDate
              ? "You haven't placed any orders."
              : "No orders match your current filters."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={isUpdating === order.id ? "pointer-events-none opacity-60" : ""}
            >
              <OrderCard order={order} onUpdateStatus={handleUpdateStatus} />
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
            Previous
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
            Next
          </Button>
        </div>
      )}
    </div>
  )
}