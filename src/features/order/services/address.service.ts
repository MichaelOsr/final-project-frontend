import api from "@/lib/axios"
import type { GetAddressesResponse } from "../types/order.types"

export const addressService = {
  getAddresses: () => api.get<GetAddressesResponse>("/addresses"),
}