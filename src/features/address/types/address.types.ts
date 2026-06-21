// Bentuk data dari/ke backend (bukan validasi form — itu di address.schemas.ts via Yup).
export interface Address {
  id: string
  name: string
  latitude: string
  longitude: string
  notes: string | null
  isDefault: boolean
}

export interface CreateAddressPayload {
  name: string
  lat: string
  lng: string
  notes?: string
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>
