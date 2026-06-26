import { useState } from "react"
import { Loader2Icon, StoreIcon, TruckIcon, CheckIcon } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { formatPrice } from "../utils/order.utils"
import type { ShippingCostItem } from "../types/order.types"

interface ShippingSelectorProps {
  options: ShippingCostItem[]
  selected: ShippingCostItem | null
  onSelect: (option: ShippingCostItem) => void
  isLoading: boolean
  originStore: string
  hasAddress: boolean
}

function isSameOption(a: ShippingCostItem | null, b: ShippingCostItem) {
  return a?.code === b.code && a?.service === b.service
}

export function ShippingSelector({
  options, selected, onSelect, isLoading, originStore, hasAddress,
}: ShippingSelectorProps) {
  const [open, setOpen] = useState(false)

  const handlePick = (option: ShippingCostItem) => {
    onSelect(option)
    setOpen(false)
  }

  if (!hasAddress) {
    return <p className="text-sm text-muted-foreground">Address not available.</p>
  }
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Calculating shipping cost...
      </div>
    )
  }
  if (options.length === 0) {
    return <p className="text-sm text-muted-foreground">No shipping options available.</p>
  }

  return (
    <div className="grid gap-2">
      {originStore && (
        <div className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2">
          <StoreIcon className="size-3.5 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            Shipped from{" "}
            <span className="font-semibold text-foreground">{originStore}</span>
          </p>
        </div>
      )}

      {/* Summary of current selection + trigger to open the full picker. */}
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        {selected ? (
          <div className="flex items-center gap-3">
            <TruckIcon className="size-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">{selected.name} {selected.service}</p>
              <p className="text-xs text-muted-foreground">
                Estimated {selected.etd} days · {formatPrice(selected.cost)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No shipping method selected</p>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0 rounded-full">
              {selected ? "Change" : "Select"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Shipping Method</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[55vh]">
              <div className="grid gap-2 pr-3">
                {options.map((option) => {
                  const active = isSameOption(selected, option)
                  return (
                    <button
                      key={`${option.code}-${option.service}`}
                      type="button"
                      onClick={() => handlePick(option)}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                        active ? "border-primary bg-accent" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{option.name} {option.service}</p>
                        <p className="text-xs text-muted-foreground">Estimated {option.etd} days</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary">{formatPrice(option.cost)}</span>
                        {active && <CheckIcon className="size-4 text-primary" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
