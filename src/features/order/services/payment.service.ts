import api from "@/lib/axios"
import type {
  UploadPaymentProofResponse,
  GetSnapTokenResponse,
} from "../types/order.types"

export const paymentService = {
  // POST /api/payment/:orderId/proof
  // Upload bukti pembayaran manual transfer.
  // Field name multer di backend: "paymentProof"
  uploadPaymentProof: (orderId: string, file: File) => {
    const formData = new FormData()
    formData.append("paymentProof", file)
    return api.post<UploadPaymentProofResponse>(
      `/payment/${orderId}/proof`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
  },

  // POST /api/payment/:orderId/snap-token
  // Request Snap Token untuk pembayaran Midtrans.
  getSnapToken: (orderId: string) =>
    api.post<GetSnapTokenResponse>(`/payment/${orderId}/snap-token`),
}