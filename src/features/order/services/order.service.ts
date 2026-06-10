import api from "@/lib/axios"
import type {
  GetOrdersResponse,
  GetOrderDetailResponse,
  CreateOrderPayload,
  GetOrdersQuery,
} from "../types/order.types"

// Thin wrapper di sekitar /orders endpoints.
// Pattern sama persis dengan cart.service.ts.
export const orderService = {
  getOrders: (query?: GetOrdersQuery) =>
    api.get<GetOrdersResponse>("/orders", { params: query }),

  getOrderDetail: (orderId: string) =>
    api.get<GetOrderDetailResponse>(`/orders/${orderId}`),

  createOrder: (payload: CreateOrderPayload) =>
    api.post<{ message: string; data: { id: string } }>("/orders", payload),

  updateOrderStatus: (orderId: string, status: "cancel" | "confirmed") =>
    api.patch<{ message: string }>(`/orders/${orderId}`, { status }),
}