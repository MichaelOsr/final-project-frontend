import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

// idle      -> nothing resolved yet (first ever visit)
// locating  -> waiting for the browser geolocation prompt
// ready     -> using the nearest store to the user
// denied    -> permission refused, falling back to the main store
// out-of-range -> nearest store is farther than the service radius
export type LocationStatus =
  | "idle"
  | "locating"
  | "ready"
  | "denied"
  | "out-of-range"

interface Coords {
  lat: number
  lng: number
}

interface LocationState {
  status: LocationStatus
  coords: Coords | null
  storeId: string | null
  storeName: string | null
  locationLabel: string | null
  error: string | null
  setLocating: () => void
  resolveStore: (payload: {
    status: "ready" | "denied"
    storeId: string
    storeName: string
    coords?: Coords
  }) => void
  setOutOfRange: (message: string) => void
  setLabel: (label: string) => void
  reset: () => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      status: "idle",
      coords: null,
      storeId: null,
      storeName: null,
      locationLabel: null,
      error: null,

      setLocating: () => set({ status: "locating", error: null }),

      resolveStore: ({ status, storeId, storeName, coords }) =>
        set((prev) => ({
          status,
          storeId,
          storeName,
          coords: coords ?? prev.coords,
          error: null,
        })),

      setOutOfRange: (message) => set({ status: "out-of-range", error: message }),

      setLabel: (label) => set({ locationLabel: label }),

      reset: () =>
        set({
          status: "idle",
          coords: null,
          storeId: null,
          storeName: null,
          locationLabel: null,
          error: null,
        }),
    }),
    {
      name: "grocergo-location",
      // sessionStorage: the chosen store survives a refresh but is cleared when
      // the tab/browser closes, so each new session re-detects the location.
      storage: createJSONStorage(() => sessionStorage),
      // Only persist a fully resolved selection; transient states (idle,
      // locating, out-of-range) fall back to "idle" so we re-prompt on reload.
      partialize: (state) => ({
        status:
          state.status === "ready" || state.status === "denied"
            ? state.status
            : "idle",
        coords: state.coords,
        storeId: state.storeId,
        storeName: state.storeName,
        locationLabel: state.locationLabel,
      }),
    }
  )
)
