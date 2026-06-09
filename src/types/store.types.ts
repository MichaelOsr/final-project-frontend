// Store + geocoding shapes used by the homepage location flow.

export interface Store {
  id: string
  name: string
  latitude: string | null
  longitude: string | null
  isMain: boolean
}

// Returned by GET /stores/nearest-store — the closest store plus how far it is
// and whether that distance exceeds the service radius.
export interface NearestStoreResult {
  store: Store
  distanceKm: number
  outOfRange: boolean
}

// Returned by the geocoding proxy (GET /geocode/address|coordinates).
export interface GeocodeResult {
  label: string
  lat: number
  lng: number
}
