import api from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { NearestStoreResult, Store } from "@/types/store.types"

// Resolves which store the homepage should show products from.
export const storeService = {
  // Closest store to the given coordinates (+ out-of-range flag).
  getNearestStore: (lat: number, lng: number) =>
    api.get<ApiResponse<NearestStoreResult>>("/stores/nearest-store", {
      params: { lat, lng },
    }),

  // Fallback store used when the user denies location.
  getMainStore: () => api.get<ApiResponse<Store>>("/stores/mainStore"),
}
