import api from "@/lib/axios"
import type { GetStoreVouchersResponse, GetUserVouchersResponse } from "../types/order.types"

export const voucherService = {
  // Fetch voucher aktif untuk toko tertentu.
  // Mengembalikan vouchers (transaction) dan deliveryVouchers (delivery).
  // Termasuk voucher global (storeId null) dan store-scoped (storeId matches).
  getStoreVouchers: (storeId: string) =>
    api.get<GetStoreVouchersResponse>(`/vouchers/store/${storeId}`),

  // Fetch voucher personal milik user yang login (reward referral, dll).
  getUserVouchers: () =>
    api.get<GetUserVouchersResponse>(`/auth/vouchers`),
}