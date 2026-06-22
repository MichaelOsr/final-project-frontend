import { useCallback, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { usePageTitle } from "@/hooks/usePageTitle"
import { useDebouncedSearchParam } from "@/features/admin/shared/hooks/useDebouncedSearchParam"
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError"
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell"
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams"
import type { PaginationMeta, StoreOption } from "@/features/admin/shared/types/admin.types"
import { adminOptionsService } from "@/features/admin/shared/services/adminOptions.service"
import { useAdminSessionStore } from "@/store/adminSession.store"
import { adminOrderService } from "../services/adminOrder.service"
import { AdminOrderFilters } from "../components/AdminOrderFilters"
import { AdminOrdersTable } from "../components/AdminOrdersTable"
import type { AdminOrderSummary } from "../types/adminOrder.types"

const defaultMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 }

export function AdminOrdersPage() {
  usePageTitle("Transactions")
  const navigate = useNavigate()
  const admin = useAdminSessionStore((state) => state.user)
  const isSuperAdmin = admin?.role === "superAdmin"
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState<AdminOrderSummary[]>([])
  const [stores, setStores] = useState<StoreOption[]>([])
  const [meta, setMeta] = useState(defaultMeta)
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useDebouncedSearchParam("search")
  const page = getPageParam(searchParams)
  const status = searchParams.get("status") ?? ""
  const storeId = searchParams.get("storeId") ?? ""
  const startDate = searchParams.get("startDate") ?? ""
  const endDate = searchParams.get("endDate") ?? ""
  const search = searchParams.get("search") ?? ""

  useEffect(() => {
    if (!isSuperAdmin) return
    adminOptionsService
      .listStores()
      .then((res) => setStores(res.data.data ?? []))
      .catch(() => {})
  }, [isSuperAdmin])

  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminOrderService.list({
        page,
        limit: 10,
        ...(status ? { status } : {}),
        ...(storeId ? { storeId } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      })
      setOrders(res.data.data ?? [])
      setMeta(res.data.meta ?? defaultMeta)
    } catch (error) {
      toast.error(getAdminErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [page, status, storeId, startDate, endDate, search])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  function updateFilters(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates))
  }

  return (
    <AdminDashboardShell>
      <div>
        <h1 className="text-xl font-semibold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Manage and monitor all customer transactions.
        </p>
      </div>
      <section className="overflow-hidden rounded-lg border border-border bg-background">
        <AdminOrderFilters
          search={searchInput}
          status={status}
          storeId={storeId}
          startDate={startDate}
          endDate={endDate}
          stores={stores}
          isSuperAdmin={isSuperAdmin}
          onChangeSearch={setSearchInput}
          onChangeStatus={(val) => updateFilters({ status: val, page: 1 })}
          onChangeStoreId={(val) => updateFilters({ storeId: val, page: 1 })}
          onChangeStartDate={(val) => updateFilters({ startDate: val, page: 1 })}
          onChangeEndDate={(val) => updateFilters({ endDate: val, page: 1 })}
        />
        <AdminOrdersTable
          orders={orders}
          isLoading={isLoading}
          paginationMeta={meta}
          onPageChange={(nextPage) => updateFilters({ page: nextPage })}
          onView={(order) => navigate(`/admin/orders/${order.id}`)}
        />
      </section>
    </AdminDashboardShell>
  )
}