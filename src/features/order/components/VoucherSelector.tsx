import { Loader2Icon } from "lucide-react"
import type { PublicVoucher } from "../types/order.types"

function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

function getVoucherLabel(v: PublicVoucher): string {
  if (v.discountType === "percentage") {
    return v.maxDiscount
      ? `${v.value}% off (max. ${formatPrice(v.maxDiscount)})`
      : `${v.value}% off`
  }
  return `${formatPrice(v.value)} off`
}

interface VoucherSelectorProps {
  vouchers: PublicVoucher[]
  selected: PublicVoucher | null
  onSelect: (v: PublicVoucher | null) => void
  // relevantAmount: subtotal untuk transaction voucher, deliveryFee untuk delivery voucher.
  // Dipakai untuk cek minimumTransaction.
  relevantAmount: number
  isLoading: boolean
}

export function VoucherSelector({
  vouchers,
  selected,
  onSelect,
  relevantAmount,
  isLoading,
}: VoucherSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Loading vouchers...
      </div>
    )
  }

  if (vouchers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No vouchers available.</p>
    )
  }

  return (
    <div className="grid gap-2">
      {vouchers.map((v) => {
        const isSelected = selected?.id === v.id
        const isDisabled =
          v.minimumTransaction !== null && relevantAmount < v.minimumTransaction

        return (
          <button
            key={v.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelect(isSelected ? null : v)}
            className={`w-full rounded-lg border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isSelected
                ? "border-primary bg-accent"
                : "border-border hover:bg-muted/50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-medium">{v.name}</p>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      v.scope === "global"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {v.scope === "global" ? "Global" : "This Store"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-semibold text-primary">
                  {getVoucherLabel(v)}
                </p>
                {v.minimumTransaction !== null && (
                  <p className="text-xs text-muted-foreground">
                    Min. purchase {formatPrice(v.minimumTransaction)}
                    {isDisabled && (
                      <span className="ml-1 text-destructive">(not met)</span>
                    )}
                  </p>
                )}
              </div>
              <p className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {v.code}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}