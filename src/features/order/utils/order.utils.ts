// Format angka ke format Rupiah, konsisten dengan cart feature.
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

// Ambil gambar utama dari array images, fallback ke placeholder.
export function getMainImage(
  images: { image: string | null; position: number }[] | undefined | null
): string {
  if (!images?.length) return "/placeholder-product.png"
  const sorted = [...images].sort((a, b) => a.position - b.position)
  return sorted[0].image ?? "/placeholder-product.png"
}

// Shape return value dari getTimeRemaining.
export interface TimeRemaining {
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

// Hitung sisa waktu dari expiry date ISO string ke sekarang.
// Dipakai di ManualTransferPage untuk countdown timer 1 jam.
export function getTimeRemaining(expiredAt: string): TimeRemaining {
  const total = new Date(expiredAt).getTime() - Date.now()
  if (total <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / (1000 * 60)) % 60)
  const hours = Math.floor(total / (1000 * 60 * 60))
  return { hours, minutes, seconds, isExpired: false }
}