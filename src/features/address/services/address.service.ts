import api from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { Address, CreateAddressPayload, UpdateAddressPayload } from "../types/address.types"

export const addressService = {
  list: () => api.get<ApiResponse<Address[]>>("/addresses"),
  create: (payload: CreateAddressPayload) =>
    api.post<ApiResponse<Address>>("/addresses", payload),
  update: (id: string, payload: UpdateAddressPayload) =>
    api.patch<ApiResponse<Address>>(`/addresses/${id}`, payload),
  setDefault: (id: string) =>
    api.patch<ApiResponse<Address>>(`/addresses/${id}/default`),
  remove: (id: string) => api.delete<ApiResponse<null>>(`/addresses/${id}`),
}
