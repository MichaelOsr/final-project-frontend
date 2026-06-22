import type { ReactNode } from "react"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { StoreOption } from "@/features/admin/shared/types/admin.types"
import type { TransactionStatus } from "@/features/order/types/order.types"

const STATUS_OPTIONS: { value: TransactionStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "waitingPayment", label: "Menunggu Pembayaran" },
  { value: "waitingConfirmation", label: "Menunggu Konfirmasi" },
  { value: "paid", label: "Pembayaran Berhasil" },
  { value: "process", label: "Diproses" },
  { value: "onDelivery", label: "Dikirim" },
  { value: "confirmed", label: "Pesanan Dikonfirmasi" },
  { value: "cancel", label: "Dibatalkan" },
]

interface AdminOrderFiltersProps {
  search: string
  status: string
  storeId: string
  startDate: string
  endDate: string
  stores: StoreOption[]
  isSuperAdmin: boolean
  onChangeSearch: (value: string) => void
  onChangeStatus: (value: string) => void
  onChangeStoreId: (value: string) => void
  onChangeStartDate: (value: string) => void
  onChangeEndDate: (value: string) => void
}

export function AdminOrderFilters({
  search,
  status,
  storeId,
  startDate,
  endDate,
  stores,
  isSuperAdmin,
  onChangeSearch,
  onChangeStatus,
  onChangeStoreId,
  onChangeStartDate,
  onChangeEndDate,
}: AdminOrderFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-border p-4">
      <div className="min-w-[14rem] flex-1">
        <Label className="mb-1.5 block text-xs text-muted-foreground">
          Search Order ID
        </Label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-9"
            placeholder="Cari order ID..."
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
          />
        </div>
      </div>
      <FilterSelect
        label="Status"
        value={status}
        onChange={onChangeStatus}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </FilterSelect>
      {isSuperAdmin && (
        <FilterSelect
          label="Store"
          value={storeId}
          onChange={onChangeStoreId}
        >
          <option value="">All stores</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </FilterSelect>
      )}
      <FilterDate
        label="Start Date"
        value={startDate}
        onChange={onChangeStartDate}
      />
      <FilterDate
        label="End Date"
        value={endDate}
        onChange={onChangeEndDate}
      />
    </div>
  )
}

function FilterSelect({
  children,
  label,
  value,
  onChange,
}: {
  children: ReactNode
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="w-40 shrink-0">
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  )
}

function FilterDate({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="w-40 shrink-0">
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      <Input
        type="date"
        className="h-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}