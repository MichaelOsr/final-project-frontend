import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AVATAR_FALLBACK } from "@/constant";
import adminAxios, { setOnAdminUnauthorized } from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { IAdminSessionUser } from "@/types/adminAuthStore.types";

const normalizeAdminUser = (payload: IAdminSessionUser): IAdminSessionUser => {
  const avatar = payload.avatar ?? AVATAR_FALLBACK;

  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    avatar,
    isVerified: payload.isVerified,
    role: payload.role,
    roleId: payload.roleId,
    store: payload.store,
  };
};

interface IAdminSessionStore {
  user: IAdminSessionUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setSession: (user: IAdminSessionUser) => void;
  setUser: (user: IAdminSessionUser) => void;
  fetchMe: () => Promise<IAdminSessionUser | null>;
  logout: () => Promise<void>;
  clearSession: () => void;
}

export const useAdminSessionStore = create<IAdminSessionStore>()(
  persist(
    (set) => ({
      user: null,
      status: "loading",

      setSession: (user) =>
        set({
          user: normalizeAdminUser(user),
          status: "authenticated",
        }),

      setUser: (user) =>
        set({
          user: normalizeAdminUser(user),
          status: "authenticated",
        }),

      fetchMe: async () => {
        try {
          const response = await adminAxios.get<ApiResponse<IAdminSessionUser>>(
            "/admin/auth/me"
          );
          const user = response.data.data ?? null;

          if (!user) {
            set({ user: null, status: "unauthenticated" });
            return null;
          }

          const normalizedUser = normalizeAdminUser(user);
          set({ user: normalizedUser, status: "authenticated" });
          return normalizedUser;
        } catch {
          set({ user: null, status: "unauthenticated" });
          return null;
        }
      },

      logout: async () => {
        try {
          await adminAxios.post<ApiResponse>("/admin/auth/logout");
        } catch {
          // Local state is cleared either way so route guards can react.
        } finally {
          set({ user: null, status: "unauthenticated" });
        }
      },

      clearSession: () =>
        set({
          user: null,
          status: "unauthenticated",
        }),
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to hydrate admin auth store", error);
        }

        if (state?.user) {
          state.user = normalizeAdminUser(state.user);
        }
      },
    }
  )
);

setOnAdminUnauthorized(() => useAdminSessionStore.getState().clearSession());
