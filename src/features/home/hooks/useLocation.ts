import { useCallback, useEffect } from "react"
import { useLocationStore } from "@/store/location.store"
import { storeService } from "@/features/home/services/store.service"
import { geocodeService } from "@/features/home/services/geocode.service"

// Drives the homepage location flow: ask the browser for coordinates, resolve
// the nearest store, and fall back to the main store when permission is denied.
export function useLocation() {
  const { status, storeId, storeName, locationLabel, error } = useLocationStore()
  const setLocating = useLocationStore((s) => s.setLocating)
  const resolveStore = useLocationStore((s) => s.resolveStore)
  const setOutOfRange = useLocationStore((s) => s.setOutOfRange)
  const setLabel = useLocationStore((s) => s.setLabel)

  // Reverse-geocode the coordinates into a readable label (best-effort).
  const loadLabel = useCallback(
    async (lat: number, lng: number) => {
      try {
        const { data } = await geocodeService.getAddress(lat, lng)
        if (data.data) setLabel(data.data.label)
      } catch {
        // The label is cosmetic — ignore failures.
      }
    },
    [setLabel]
  )

  // Shared by geolocation success and manual search: pick the nearest store.
  const resolveNearest = useCallback(
    async (lat: number, lng: number, knownLabel?: string) => {
      const { data } = await storeService.getNearestStore(lat, lng)
      const result = data.data
      if (!result) return

      if (result.outOfRange) {
        setOutOfRange(
          `No store serves your area yet (nearest is ${result.store.name}, ~${Math.round(result.distanceKm)} km away).`
        )
        return
      }

      resolveStore({
        status: "ready",
        storeId: result.store.id,
        storeName: result.store.name,
        coords: { lat, lng },
      })
      if (knownLabel) setLabel(knownLabel)
      else void loadLabel(lat, lng)
    },
    [resolveStore, setOutOfRange, setLabel, loadLabel]
  )

  // Permission denied / unsupported: use the configured main store.
  const fallbackToMainStore = useCallback(async () => {
    try {
      const { data } = await storeService.getMainStore()
      const store = data.data
      if (!store) return
      resolveStore({ status: "denied", storeId: store.id, storeName: store.name })
    } catch {
      setOutOfRange("We couldn't determine a store for your location.")
    }
  }, [resolveStore, setOutOfRange])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      void fallbackToMainStore()
      return
    }
    setLocating()
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolveNearest(pos.coords.latitude, pos.coords.longitude).catch(() =>
          fallbackToMainStore()
        ),
      () => void fallbackToMainStore(),
      { timeout: 10000, maximumAge: 60000 }
    )
  }, [setLocating, resolveNearest, fallbackToMainStore])

  // Manual "try another area" search via place name.
  const searchManualLocation = useCallback(
    async (query: string) => {
      const { data } = await geocodeService.getCoordinates(query)
      const place = data.data
      if (place) await resolveNearest(place.lat, place.lng, place.label)
    },
    [resolveNearest]
  )

  // On first ever visit (nothing persisted), prompt for location once.
  useEffect(() => {
    if (useLocationStore.getState().status === "idle") requestLocation()
  }, [requestLocation])

  return {
    status,
    storeId,
    storeName,
    locationLabel,
    error,
    requestLocation,
    searchManualLocation,
  }
}
