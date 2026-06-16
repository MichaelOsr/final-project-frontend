import { useCallback, useEffect, useState } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/error"
import { addressService } from "../services/address.service"
import { AddressForm } from "./AddressForm"
import type { Address } from "../types/address.types"

type Mode =
  | { type: "list" }
  | { type: "create" }
  | { type: "edit"; address: Address }

export function AddressSection() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<Mode>({ type: "list" })

  const load = useCallback(async () => {
    try {
      const { data } = await addressService.list()
      setAddresses(data.data ?? [])
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, []) // setter dari useState stabil, jadi deps kosong aman

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const { data } = await addressService.list()
        if (active) setAddresses(data.data ?? [])
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const afterChange = async () => {
    setMode({ type: "list" })
    await load()
  }

  const handleSetDefault = async (id: string) => {
    try { await addressService.setDefault(id); await load() }
    catch (error) { toast.error(getErrorMessage(error)) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this address?")) return
    try { await addressService.remove(id); toast.success("Address deleted"); await load() }
    catch (error) { toast.error(getErrorMessage(error)) }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Delivery addresses</CardTitle>
        {mode.type === "list" && (
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => setMode({ type: "create" })}>
              <PlusIcon /> Add address
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="grid gap-3">
        {mode.type === "create" && <AddressForm onDone={afterChange} />}
        {mode.type === "edit" && <AddressForm address={mode.address} onDone={afterChange} />}

        {mode.type === "list" && (
          loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No addresses yet.</p>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="flex items-start justify-between rounded-md border p-3">
                <div className="grid gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{addr.name}</span>
                    {addr.isDefault && (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Default</span>
                    )}
                  </div>
                  {addr.notes && <span className="text-sm text-muted-foreground">{addr.notes}</span>}
                  <span className="text-xs text-muted-foreground">
                    {Number(addr.latitude).toFixed(5)}, {Number(addr.longitude).toFixed(5)}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!addr.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => handleSetDefault(addr.id)}>
                      Set default
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setMode({ type: "edit", address: addr })}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(addr.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )
        )}
      </CardContent>
    </Card>
  )
}
