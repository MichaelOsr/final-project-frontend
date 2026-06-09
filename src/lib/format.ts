// Format a number as Indonesian Rupiah, e.g. 15000 -> "Rp15.000".
// Shared so every price on the site renders identically.
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}
