// Type declarations untuk Midtrans Snap.js yang di-load via CDN.
// Docs: https://docs.midtrans.com/docs/snap-js

interface SnapCallbackResult {
  order_id: string
  transaction_status: string
  fraud_status?: string
  payment_type?: string
}

interface SnapEmbedOptions {
  embedId: string
  onSuccess?: (result: SnapCallbackResult) => void
  onPending?: (result: SnapCallbackResult) => void
  onError?: (result: SnapCallbackResult) => void
  onClose?: () => void
}

interface SnapPayOptions {
  onSuccess?: (result: SnapCallbackResult) => void
  onPending?: (result: SnapCallbackResult) => void
  onError?: (result: SnapCallbackResult) => void
  onClose?: () => void
}

interface Snap {
  embed: (token: string, options: SnapEmbedOptions) => void
  pay: (token: string, options?: SnapPayOptions) => void
}

interface Window {
  snap: Snap
}