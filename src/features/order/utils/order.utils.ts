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