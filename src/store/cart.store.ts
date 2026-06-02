import { create } from "zustand"
import { cartService } from "@/features/cart/services/cart.service"
import type { Cart, CartItem } from "@/types/cart.types"

interface CartState {
  cart: Cart | null
  // Derived: total jumlah item (sum of quantity) untuk badge di Navbar.
  totalItems: number
  isLoading: boolean
  // Fetch ulang cart dari server.
  fetchCart: () => Promise<void>
  // Update quantity satu item secara optimistik, lalu sync ke server.
  updateItem: (cartItemId: string, quantity: number) => Promise<void>
  // Hapus satu item secara optimistik, lalu sync ke server.
  removeItem: (cartItemId: string) => Promise<void>
  // Reset state ketika user logout.
  clear: () => void
}

function computeTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  totalItems: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true })
    try {
      const { data } = await cartService.getCart()
      const cart = data.data ?? null
      const items = cart?.items ?? []
      set({ cart, totalItems: computeTotalItems(items) })
    } catch {
      // Jika gagal (misal belum login), biarkan cart tetap null.
      set({ cart: null, totalItems: 0 })
    } finally {
      set({ isLoading: false })
    }
  },

  updateItem: async (cartItemId, quantity) => {
    const prev = get().cart
    // Optimistic update: langsung ubah di state sebelum request selesai.
    if (prev) {
      const updatedItems = prev.items.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
      const updatedCart = { ...prev, items: updatedItems }
      set({ cart: updatedCart, totalItems: computeTotalItems(updatedItems) })
    }
    try {
      await cartService.updateCartItem(cartItemId, { quantity })
    } catch {
      // Rollback jika request gagal.
      set({
        cart: prev,
        totalItems: computeTotalItems(prev?.items ?? []),
      })
      throw new Error("Gagal memperbarui jumlah produk")
    }
  },

  removeItem: async (cartItemId) => {
    const prev = get().cart
    // Optimistic update: langsung hilangkan item dari state.
    if (prev) {
      const updatedItems = prev.items.filter((item) => item.id !== cartItemId)
      const updatedCart = { ...prev, items: updatedItems }
      set({ cart: updatedCart, totalItems: computeTotalItems(updatedItems) })
    }
    try {
      await cartService.deleteCartItem(cartItemId)
    } catch {
      // Rollback jika request gagal.
      set({
        cart: prev,
        totalItems: computeTotalItems(prev?.items ?? []),
      })
      throw new Error("Gagal menghapus produk dari cart")
    }
  },

  clear: () => set({ cart: null, totalItems: 0, isLoading: false }),
}))