// Mirrors DiscountType enum dari backend Prisma schema.
export type DiscountType = "percentage" | "nominal" | "buyXGetY"

// Discount aktif yang di-include backend saat fetch cart.
export interface CartItemDiscount {
  id: string
  name: string
  type: DiscountType
  buyQuantity: number | null
  getQuantity: number | null
  value: number | null
  startDate: string
  endDate: string
}

// Stok per toko yang di-include backend saat fetch cart.
export interface CartItemProductStock {
  id: string
  storeId: string
  stock: number
}

// Gambar produk yang di-include backend saat fetch cart.
export interface CartItemProductImage {
  id: string
  image: string | null
  publicId: string | null
  position: number
}

// Shape produk yang di-include di dalam setiap item cart.
export interface CartItemProduct {
  id: string
  name: string
  slug: string | null
  price: number
  brand: string | null
  variant: string | null
  size: string | null
  images: CartItemProductImage[]
  stocks: CartItemProductStock[]
  discounts: CartItemDiscount[]
}

// Satu baris item dalam cart (CartItem dari Prisma + product yang di-include).
export interface CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  createdAt: string
  updatedAt: string
  product: CartItemProduct
}

// Shape lengkap response GET /cart (field `data` dari ApiResponse).
export interface Cart {
  id: string
  userId: string
  items: CartItem[]
}

// Payload untuk POST /cart (add to cart).
export interface AddToCartPayload {
  productId: string
  quantity: number
  storeId: string
}

// Payload untuk PATCH /cart/:cartItemId (update quantity).
export interface UpdateCartPayload {
  quantity: number
}