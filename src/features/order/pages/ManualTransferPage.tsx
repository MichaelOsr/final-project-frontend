import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeftIcon,
  Loader2Icon,
  UploadIcon,
  Building2Icon,
  TimerIcon,
  ReceiptIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOrderStore } from "@/store/order.store"
import { paymentService } from "../services/payment.service"
import { formatPrice, getTimeRemaining } from "../utils/order.utils"
import { usePageTitle } from "@/hooks/usePageTitle"
import type { TimeRemaining } from "../utils/order.utils"

// Info rekening tujuan transfer — satu rekening untuk semua cabang.
// Ganti sesuai rekening bisnis aktual sebelum production.
const BANK_INFO = {
  bankName: "BCA",
  accountNumber: "1234567890",
  accountName: "PT GrocerGo Indonesia",
}

export function ManualTransferPage() {
  usePageTitle("Transfer Manual")
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { orderDetail, isLoadingDetail, fetchOrderDetail, clearDetail } = useOrderStore()

  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch order detail saat mount
  useEffect(() => {
    if (orderId) fetchOrderDetail(orderId)
    return () => clearDetail()
  }, [orderId, fetchOrderDetail, clearDetail])

  // Redirect ke order detail kalau status sudah bukan waitingPayment.
  // Misal user akses ulang URL ini setelah bukti sudah diupload.
  useEffect(() => {
    if (!isLoadingDetail && orderDetail && orderDetail.transactionStatus !== "waitingPayment") {
      navigate(`/orders/${orderId}`, { replace: true })
    }
  }, [isLoadingDetail, orderDetail, orderId, navigate])

  // Mulai countdown interval setelah paymentExpiredAt tersedia
  useEffect(() => {
    if (!orderDetail?.paymentExpiredAt) return
    const expiredAt = orderDetail.paymentExpiredAt
    const tick = () => setTimeLeft(getTimeRemaining(expiredAt))
    tick() // langsung hitung sekali dulu tanpa nunggu 1 detik
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [orderDetail?.paymentExpiredAt])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Hanya file JPG atau PNG yang diizinkan")
      return
    }
    if (file.size > 1024 * 1024) {
      toast.error("Ukuran file maksimal 1MB")
      return
    }
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    // Reset input value supaya file yang sama bisa dipilih ulang
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async () => {
    if (!orderId || !selectedFile) return
    setIsUploading(true)
    try {
      await paymentService.uploadPaymentProof(orderId, selectedFile)
      toast.success("Bukti pembayaran berhasil dikirim!")
      navigate(`/orders/${orderId}`)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal mengirim bukti pembayaran"
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoadingDetail) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-20">
        <Loader2Icon className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!orderDetail) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-muted-foreground">Pesanan tidak ditemukan.</p>
      </div>
    )
  }

  const isExpired = timeLeft?.isExpired ?? false

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(`/orders/${orderId}`)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Kembali ke detail pesanan
        </button>
        <h1 className="text-xl font-bold">Transfer Manual</h1>
      </div>

      <div className="grid gap-4">
        {/* Countdown timer */}
        <div
          className={`rounded-xl border p-5 ${
            isExpired ? "border-destructive bg-red-50" : "border-border bg-card"
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            <TimerIcon
              className={`size-4 ${isExpired ? "text-destructive" : "text-primary"}`}
            />
            <h2 className="text-sm font-bold">Batas Waktu Pembayaran</h2>
          </div>
          {isExpired ? (
            <p className="text-sm font-semibold text-destructive">
              Waktu pembayaran sudah habis. Pesanan akan dibatalkan secara otomatis.
            </p>
          ) : timeLeft ? (
            <p className="text-3xl font-bold tabular-nums text-primary">
              {String(timeLeft.hours).padStart(2, "0")}:
              {String(timeLeft.minutes).padStart(2, "0")}:
              {String(timeLeft.seconds).padStart(2, "0")}
            </p>
          ) : (
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Total yang harus dibayar */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <ReceiptIcon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Total Pembayaran</h2>
          </div>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(orderDetail.totalPrice)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pastikan nominal transfer sesuai persis dengan angka di atas.
          </p>
        </div>

        {/* Info rekening tujuan */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Building2Icon className="size-4 text-primary" />
            <h2 className="text-sm font-bold">Rekening Tujuan</h2>
          </div>
          <div className="grid gap-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Bank</span>
              <span className="font-semibold">{BANK_INFO.bankName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">No. Rekening</span>
              <span className="font-mono font-semibold tracking-wider">
                {BANK_INFO.accountNumber}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Atas Nama</span>
              <span className="font-semibold">{BANK_INFO.accountName}</span>
            </div>
          </div>
        </div>

        {/* Upload bukti bayar — disembunyikan kalau sudah expired */}
        {!isExpired && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <UploadIcon className="size-4 text-primary" />
              <h2 className="text-sm font-bold">Upload Bukti Pembayaran</h2>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Format JPG atau PNG, maksimal 1MB.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <div className="mb-3">
                <img
                  src={previewUrl}
                  alt="Preview bukti pembayaran"
                  className="max-h-52 w-full rounded-lg border border-border object-contain"
                />
                <button
                  type="button"
                  className="mt-2 text-xs text-muted-foreground underline hover:text-foreground"
                  onClick={handleClearFile}
                >
                  Ganti gambar
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-8 transition-colors hover:border-primary hover:bg-accent"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon className="size-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Klik untuk pilih gambar</span>
              </button>
            )}

            <Button
              className="mt-3 h-11 w-full rounded-full font-semibold"
              disabled={!selectedFile || isUploading}
              onClick={handleSubmit}
            >
              {isUploading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Bukti Pembayaran"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}