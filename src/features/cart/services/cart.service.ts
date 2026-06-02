import api from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { Cart, AddToCartPayload, UpdateCartPayload } from "@/types/cart.types"

// Thin wrapper di sekitar /cart endpoints.
// Setiap method peta 1:1 ke route backend.
// Cookie auth ditangani otomatis oleh axios instance.
export const cartService = {
  getCart: () =>
    api.get<ApiResponse<Cart>>("/cart"),

  addToCart: (payload: AddToCartPayload) =>
    api.post<ApiResponse>("/cart", payload),

  updateCartItem: (cartItemId: string, payload: UpdateCartPayload) =>
    api.patch<ApiResponse>(`/cart/${cartItemId}`, payload),

  deleteCartItem: (cartItemId: string) =>
    api.delete<ApiResponse>(`/cart/${cartItemId}`),
}