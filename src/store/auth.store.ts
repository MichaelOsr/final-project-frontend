import { create } from "zustand"
import api, { setOnUnauthorized } from "@/lib/axios"
import type { User } from "@/types/user.types"
import type { ApiResponse } from "@/types/api.types"

// "loading" until the first /me check resolves; this lets guards show a splash
// instead of briefly redirecting authenticated users to /login on refresh.
type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthState {
  user: User | null
  status: AuthStatus
  setUser: (user: User) => void
  clear: () => void
  fetchMe: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  setUser: (user) => set({ user, status: "authenticated" }),
  clear: () => set({ user: null, status: "unauthenticated" }),
  fetchMe: async () => {
    try {
      const { data } = await api.get<ApiResponse<User>>("/auth/me")
      const user = data.data ?? null
      set({ user, status: user ? "authenticated" : "unauthenticated" })
    } catch {
      set({ user: null, status: "unauthenticated" })
    }
  },
  logout: async () => {
    try {
      await api.post("/auth/logout")
    } catch {
      // Ignore network/401 errors: clearing local state below is what matters.
    } finally {
      set({ user: null, status: "unauthenticated" })
    }
  },
}))

// When a token refresh fails for good, drop the session so ProtectedRoute
// reactively redirects to /login.
setOnUnauthorized(() => useAuthStore.getState().clear())
