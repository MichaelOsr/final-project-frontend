import api from "@/lib/axios"
import type { GetShippingCostResponse } from "../types/order.types"

export const shippingService = {
  getShippingCost: (addressId: string) =>
    api.get<GetShippingCostResponse>("/shipping/cost", {
      params: { addressId },
    }),
}