// Status transaksi sesuai Prisma enum di backend.
export type TransactionStatus =
  | "waitingPayment"
  | "waitingConfirmation"
  | "process"
  | "onDelivery"
  | "confirmed"
  | "cancel"

// Metode pembayaran — slot ini yang nanti diisi integrasi Midtrans.
export type PaymentMethod = "manual_transfer" | "midtrans"

// Item di dalam sebuah order (TransactionItem dari backend).
export interface OrderItem {
  id: string
  productId: string
  name: string
  quantity: number
  totalPrice: number
  discountId: string | null
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

// Store yang ada di dalam order detail.
export interface OrderStore {
  id: string
  name: string
  address: string | null
}

// Shape order di list (findTransactionsByCustomer — includes items + store).
export interface OrderSummary {
  id: string
  transactionStatus: TransactionStatus
  totalPrice: number
  deliveryFee: number
  shipping_vendor: string
  createdAt: string
  updatedAt: string
  storeId: string
  store: OrderStore
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

// Shape order detail (findTransactionById — includes items+product, voucher, dll).
export interface OrderDetail {
  id: string
  transactionStatus: TransactionStatus
  totalPrice: number
  deliveryFee: number
  shipping_vendor: string
  createdAt: string
  updatedAt: string
  storeId: string
  customerId: string
  addressId: string
  voucherId: string | null
  deliveryVoucherId: string | null
  store: OrderStore
  items: OrderItem[]
  voucher: {
    id: string
    name: string
    value: number
    discountType: string
  } | null
  deliveryVoucher: {
    id: string
    name: string
    value: number
    discountType: string
  } | null
}

// Pagination meta dari backend.
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

// Response GET /api/orders
export interface GetOrdersResponse {
  message: string
  data: OrderSummary[]
  meta: PaginationMeta
}

// Response GET /api/orders/:orderId
export interface GetOrderDetailResponse {
  message: string
  data: OrderDetail
}

// Payload POST /api/orders
export interface CreateOrderPayload {
  addressId: string
  shippingVendor: string
  deliveryFee: number
  voucherId?: string
  deliveryVoucherId?: string
  items: {
    productId: string
    quantity: number
    discountId?: string
  }[]
}

// Query params untuk GET /api/orders
export interface GetOrdersQuery {
  page?: number
  limit?: number
  status?: string
  startDate?: string
  endDate?: string
  search?: string
}