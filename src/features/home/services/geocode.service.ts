import api from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { GeocodeResult } from "@/types/store.types"

// Proxy to the backend OpenCage endpoints (the API key stays server-side).
export const geocodeService = {
  // Coordinates -> human-readable address (for the "showing products near ..." label).
  getAddress: (lat: number, lng: number) =>
    api.get<ApiResponse<GeocodeResult>>("/geocode/address", {
      params: { lat, lng },
    }),

  // Place name -> coordinates (for the manual "try another area" search).
  getCoordinates: (q: string) =>
    api.get<ApiResponse<GeocodeResult>>("/geocode/coordinates", {
      params: { q },
    }),
}
