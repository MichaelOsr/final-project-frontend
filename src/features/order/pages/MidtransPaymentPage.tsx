import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2Icon, ShieldCheckIcon, CreditCardIcon, ArrowLeftIcon } from "lucide-react"
import { paymentService } from "../services/payment.service"
import { usePageTitle } from "@/hooks/usePageTitle"

export function MidtransPaymentPage() {
  usePageTitle("Payment")
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [snapToken, setSnapToken] = useState<string | null>(null)
  const [isLoadingToken, setIsLoadingToken] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasEmbedded = useRef(false)
  // Guard against double invocation in React Strict Mode (development).
  const hasFetchedToken = useRef(false)

  // Step 1: Dynamically load Snap.js from Midtrans CDN.
  useEffect(() => {
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true"
    const snapUrl = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js"

    const script = document.createElement("script")
    script.src = snapUrl
    script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY ?? "")
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = () => setError("Failed to load payment page. Please check your internet connection.")
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Step 2: Request Snap Token from backend.
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
            ?.message ?? "Failed to get payment token"
        setError(message)
      } finally {
        setIsLoadingToken(false)
      }
    }
    fetchToken()
  }, [orderId])

  // Step 3: Embed Snap once both script and token are ready.
  useEffect(() => {
    if (!isScriptLoaded || !snapToken || hasEmbedded.current) return
    if (!window.snap) return

    hasEmbedded.current = true

    window.snap.embed(snapToken, {
      embedId: "snap-container",
      onSuccess: () => navigate(`/orders/${orderId}`),
      onPending: () => navigate(`/orders/${orderId}`),
      onError: () => {
        toast.error("Payment failed. Please try again from your order page.")
        navigate(`/orders/${orderId}`)
      },
      onClose: () => navigate(`/orders/${orderId}`),
    })
  }, [isScriptLoaded, snapToken, orderId, navigate])

  const isLoading = isLoadingToken || !isScriptLoaded

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(`/orders/${orderId}`)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back to order details
        </button>
        <h1 className="text-xl font-bold">Payment</h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-destructive">{error}</p>
          <button
            type="button"
            className="mt-3 text-sm text-muted-foreground underline hover:text-foreground"
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            Back to order details
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Info card above snap container */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <CreditCardIcon className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Choose payment method</p>
                  <p className="text-xs text-muted-foreground">Powered by Midtrans</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1">
                <ShieldCheckIcon className="size-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-700">Secure & Encrypted</span>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16">
              <Loader2Icon className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading payment page...</p>
            </div>
          )}

          {/* Target container for snap.embed().
              Must exist in the DOM when snap.embed is called,
              so we hide with class instead of conditional render. */}
          <div
            id="snap-container"
            className={isLoading ? "hidden" : "min-h-125 w-full overflow-hidden rounded-xl border border-border"}
          />
        </div>
      )}
    </div>
  )
}