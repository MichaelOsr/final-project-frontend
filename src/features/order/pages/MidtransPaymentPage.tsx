import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2Icon, ShieldCheckIcon, CreditCardIcon, ArrowLeftIcon } from "lucide-react"
import { paymentService } from "../services/payment.service"
import { usePageTitle } from "@/hooks/usePageTitle"

export function MidtransPaymentPage() {
  usePageTitle("Pembayaran")
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [snapToken, setSnapToken] = useState<string | null>(null)
  const [isLoadingToken, setIsLoadingToken] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasEmbedded = useRef(false)
  // Guard supaya getSnapToken API tidak dipanggil dua kali
  // (React Strict Mode double-invocation di development)
  const hasFetchedToken = useRef(false)

  // Step 1: Load Snap.js dari CDN Midtrans secara dinamis.
  useEffect(() => {
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true"
    const snapUrl = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js"

    const script = document.createElement("script")
    script.src = snapUrl
    script.setAttribute(
      "data-client-key",
      import.meta.env.VITE_MIDTRANS_CLIENT_KEY ?? "",
    )
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = () => setError("Gagal memuat halaman pembayaran. Periksa koneksi internet kamu.")
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Step 2: Request Snap Token dari backend.
  // hasFetchedToken.current mencegah double-call di React Strict Mode.
  useEffect(() => {
    if (!orderId || hasFetchedToken.current) return
    hasFetchedToken.current = true

    const fetchToken = async () => {
      try {
        const { data } = await paymentService.getSnapToken(orderId)
        setSnapToken(data.data.snapToken)
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "Gagal mendapatkan token pembayaran"
        setError(message)
      } finally {
        setIsLoadingToken(false)
      }
    }
    fetchToken()
  }, [orderId])

  // Step 3: Embed Snap setelah script dan token keduanya siap.
  useEffect(() => {
    if (!isScriptLoaded || !snapToken || hasEmbedded.current) return
    if (!window.snap) return

    hasEmbedded.current = true

    window.snap.embed(snapToken, {
      embedId: "snap-container",
      onSuccess: () => navigate(`/orders/${orderId}`),
      onPending: () => navigate(`/orders/${orderId}`),
      onError: () => {
        toast.error("Pembayaran gagal. Silakan coba lagi dari halaman pesanan.")
        navigate(`/orders/${orderId}`)
      },
      onClose: () => navigate(`/orders/${orderId}`),
    })
  }, [isScriptLoaded, snapToken, orderId, navigate])

  const isLoading = isLoadingToken || !isScriptLoaded

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(`/orders/${orderId}`)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Kembali ke detail pesanan
        </button>
        <h1 className="text-xl font-bold">Pembayaran</h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-destructive">{error}</p>
          <button
            type="button"
            className="mt-3 text-sm text-muted-foreground underline hover:text-foreground"
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            Kembali ke detail pesanan
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Info card di atas snap container */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <CreditCardIcon className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Pilih metode pembayaran</p>
                  <p className="text-xs text-muted-foreground">
                    Didukung oleh Midtrans
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1">
                <ShieldCheckIcon className="size-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-700">Aman & Terenkripsi</span>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16">
              <Loader2Icon className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Menyiapkan halaman pembayaran...
              </p>
            </div>
          )}

          {/* Container target untuk snap.embed().
              Harus ada di DOM saat snap.embed dipanggil,
              jadi kita hide via class bukan conditional render. */}
          <div
            id="snap-container"
            className={isLoading ? "hidden" : "min-h-125 w-full overflow-hidden rounded-xl border border-border"}
          />
        </div>
      )}
    </div>
  )
}