import type { TransactionStatus } from "../types/order.types"

// Label yang ditampilkan ke user per status.
export const STATUS_LABEL: Record<TransactionStatus, string> = {
  waitingPayment: "Menunggu Pembayaran",
  waitingConfirmation: "Menunggu Konfirmasi",
  process: "Diproses",
  onDelivery: "Dikirim",
  confirmed: "Pesanan Dikonfirmasi",
  cancel: "Dibatalkan",
}

// Warna badge per status (Tailwind classes).
export const STATUS_COLOR: Record<
  TransactionStatus,
  { bg: string; text: string }
> = {
  waitingPayment: { bg: "bg-yellow-100", text: "text-yellow-700" },
  waitingConfirmation: { bg: "bg-blue-100", text: "text-blue-700" },
  process: { bg: "bg-indigo-100", text: "text-indigo-700" },
  onDelivery: { bg: "bg-cyan-100", text: "text-cyan-700" },
  confirmed: { bg: "bg-green-100", text: "text-green-700" },
  cancel: { bg: "bg-red-100", text: "text-red-600" },
}

interface OrderStatusBadgeProps {
  status: TransactionStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { bg, text } = STATUS_COLOR[status] ?? {
    bg: "bg-muted",
    text: "text-muted-foreground",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg} ${text}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}