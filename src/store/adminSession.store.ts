import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AVATAR_FALLBACK } from "@/constant";
import { setOnAdminUnauthorized } from "@/lib/adminAxios";
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
  isHydrated: boolean;
  setSession: (user: IAdminSessionUser) => void;
  setUser: (user: IAdminSessionUser) => void;
  setHydrated: (state: boolean) => void;
  clearSession: () => void;
}

export const useAdminSessionStore = create<IAdminSessionStore>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,

      setSession: (user) =>
        set({
          user: normalizeAdminUser(user),
        }),

      setUser: (user) =>
        set({
          user: normalizeAdminUser(user),
        }),

      setHydrated: (state) =>
        set({
          isHydrated: state,
        }),

      clearSession: () =>
        set({
          user: null,
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

        const hydratedUser = state?.user ?? null;

        if (hydratedUser) {
          state?.setUser(hydratedUser);
        }

        state?.setHydrated(true);
      },
    },
  ),
);

setOnAdminUnauthorized(() => useAdminSessionStore.getState().clearSession());
