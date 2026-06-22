import adminAxios from "@/lib/adminAxios"
import type {
  AdminGetOrdersQuery,
  GetAdminOrderDetailResponse,
  GetAdminOrdersResponse,
} from "../types/adminOrder.types"

export const adminOrderService = {
  list: (params: AdminGetOrdersQuery) =>
    adminAxios.get<GetAdminOrdersResponse>("/admin/orders", { params }),

  getById: (orderId: string) =>
    adminAxios.get<GetAdminOrderDetailResponse>(`/admin/orders/${orderId}`),

  confirmPayment: (orderId: string, action: "approve" | "reject") =>
    adminAxios.patch(`/admin/orders/${orderId}/payment`, { action }),

  shipOrder: (orderId: string) =>
    adminAxios.patch(`/admin/orders/${orderId}/ship`),

  cancelOrder: (orderId: string) =>
    adminAxios.patch(`/admin/orders/${orderId}/cancel`),
}