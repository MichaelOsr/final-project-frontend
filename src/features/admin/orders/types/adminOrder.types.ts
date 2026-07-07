import type { TransactionStatus } from "@/features/order/types/order.types"

export type { TransactionStatus }

export interface AdminOrderCustomer {
  id: string
  name: string
  email: string
}

export interface AdminOrderStore {
  id: string
  name: string
  address: string | null
}

export interface AdminOrderAddress {
  id: string
  name: string
  latitude: string
  longitude: string
  notes: string | null
}

export interface AdminOrderItem {
  id: string
  productId: string
  name: string
  quantity: number
  totalPrice: number
  discountId: string | null
  requiresFulfillment: boolean
  storeStockAtOrder: number | null
  shortageQuantity: number | null
  notes: string | null
  product: {
    id: string
    name: string
    price: number
    brand: string | null
    variant: string | null
    size: string | null
    images: { id: string; image: string | null; position: number }[]
  }
  discount: {
    id: string
    name: string
    type: string
    value: number | null
  } | null
}

export interface AdminOrderSummary {
  id: string
  transactionStatus: TransactionStatus
  totalPrice: number
  deliveryFee: number
  shipping_vendor: string
  createdAt: string
  updatedAt: string
  storeId: string
  store: AdminOrderStore
  customer: AdminOrderCustomer
  items: {
    id: string
    name: string
    quantity: number
    totalPrice: number
    product: {
      id: string
      name: string
      price: number
      images: { id: string; image: string | null; position: number }[]
    }
  }[]
}

export interface AdminOrderDetail {
  id: string
  transactionStatus: TransactionStatus
  totalPrice: number
  deliveryFee: number
  shipping_vendor: string
  paymentType: string | null
  paymentProof: string | null
  paymentExpiredAt: string | null
  createdAt: string
  updatedAt: string
  storeId: string
  customerId: string
  addressId: string | null
  voucherId: string | null
  deliveryVoucherId: string | null
  store: AdminOrderStore
  customer: AdminOrderCustomer
  items: AdminOrderItem[]
  address: AdminOrderAddress | null
  voucher: { id: string; name: string; value: number; discountType: string } | null
  deliveryVoucher: { id: string; name: string; value: number; discountType: string } | null
}

export interface AdminGetOrdersQuery {
  page?: number
  limit?: number
  storeId?: string
  status?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface AdminOrderMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetAdminOrdersResponse {
  message: string
  data: AdminOrderSummary[]
  meta: AdminOrderMeta
}

export interface GetAdminOrderDetailResponse {
  message: string
  data: AdminOrderDetail
}