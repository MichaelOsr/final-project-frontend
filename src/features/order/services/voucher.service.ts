import api from "@/lib/axios"
import type { GetStoreVouchersResponse } from "../types/order.types"

export const voucherService = {
  // Fetch voucher aktif untuk toko tertentu.
  // Mengembalikan vouchers (transaction) dan deliveryVouchers (delivery).
  // Termasuk voucher global (storeId null) dan store-scoped (storeId matches).
  getStoreVouchers: (storeId: string) =>
    api.get<GetStoreVouchersResponse>(`/vouchers/store/${storeId}`),
}