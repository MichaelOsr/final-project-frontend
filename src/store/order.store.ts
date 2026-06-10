import { create } from "zustand"
import { orderService } from "@/features/order/services/order.service"
import type {
  OrderSummary,
  OrderDetail,
  PaginationMeta,
  GetOrdersQuery,
  CreateOrderPayload,
} from "@/features/order/types/order.types"

interface OrderState {
  // List orders
  orders: OrderSummary[]
  meta: PaginationMeta | null
  isLoadingList: boolean

  // Detail order
  orderDetail: OrderDetail | null
  isLoadingDetail: boolean

  // Fetch list
  fetchOrders: (query?: GetOrdersQuery) => Promise<void>

  // Fetch single order
  fetchOrderDetail: (orderId: string) => Promise<void>

  // Create order — return orderId biar halaman bisa redirect
  createOrder: (payload: CreateOrderPayload) => Promise<string>

  // Update status order (cancel / confirmed)
  updateOrderStatus: (orderId: string, status: "cancel" | "confirmed") => Promise<void>

  // Reset detail saat unmount
  clearDetail: () => void
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  meta: null,
  isLoadingList: false,

  orderDetail: null,
  isLoadingDetail: false,

  fetchOrders: async (query) => {
    set({ isLoadingList: true })
    try {
      const { data } = await orderService.getOrders(query)
      set({ orders: data.data, meta: data.meta })
    } finally {
      set({ isLoadingList: false })
    }
  },

  fetchOrderDetail: async (orderId) => {
    set({ isLoadingDetail: true })
    try {
      const { data } = await orderService.getOrderDetail(orderId)
      set({ orderDetail: data.data })
    } finally {
      set({ isLoadingDetail: false })
    }
  },

  createOrder: async (payload) => {
    const { data } = await orderService.createOrder(payload)
    return data.data.id
  },

  updateOrderStatus: async (orderId, status) => {
    await orderService.updateOrderStatus(orderId, status)
    const updatedOrders = get().orders.map((o) =>
      o.id === orderId ? { ...o, transactionStatus: status } : o
    )
    set({ orders: updatedOrders })
    const detail = get().orderDetail
    if (detail?.id === orderId) {
      set({ orderDetail: { ...detail, transactionStatus: status } })
    }
  },

  clearDetail: () => set({ orderDetail: null }),
}))