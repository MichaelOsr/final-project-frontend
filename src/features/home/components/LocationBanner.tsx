import { useState, useEffect } from "react"
import { MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/error"
import { addressService } from "@/features/address/services/address.service"
import type { Address } from "@/features/address/types/address.types"
import type { LocationStatus } from "@/store/location.store"

interface LocationBannerProps {
  status: LocationStatus
  storeName: string | null
  locationLabel: string | null
  error: string | null
  isAuthenticated: boolean
  onChangeLocation: () => void
  onSearch: (query: string) => Promise<void>
  onSelectAddress: (lat: number, lng: number) => Promise<void>
}

export function LocationBanner({
  status,
  locationLabel,
  error,
  isAuthenticated,
  onChangeLocation,
  onSearch,
  onSelectAddress,
}: LocationBannerProps) {
  const [query, setQuery] = useState("")
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [selectingId, setSelectingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditing || !isAuthenticated) return
    setIsLoadingAddresses(true)
    addressService
      .list()
      .then(({ data }) => setAddresses(data.data ?? []))
      .catch(() => setAddresses([]))
      .finally(() => setIsLoadingAddresses(false))
  }, [isEditing, isAuthenticated])

  const closeEdit = () => {
    setIsEditing(false)
    setSearchError(null)
    setQuery("")
    setAddresses([])
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!query.trim()) {
      setSearchError("Please enter a city or area.")
      return
    }
    setIsSearching(true)
    setSearchError(null)
    try {
      await onSearch(query.trim())
      closeEdit()
    } catch (err) {
      setSearchError(getErrorMessage(err, "We couldn't find that location."))
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectAddress = async (address: Address) => {
    setSelectingId(address.id)
    try {
      await onSelectAddress(parseFloat(address.latitude), parseFloat(address.longitude))
      closeEdit()
    } catch {
      // resolveNearest handles its own error state; just close editing
      closeEdit()
    } finally {
      setSelectingId(null)
    }
  }

  if (status === "locating") {
    return (
      <p className="text-sm text-muted-foreground">Detecting your location…</p>
    )
  }

  if (status === "out-of-range") {
    return (
      <div className="grid gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{error}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try another city or area"
            aria-label="Search another location"
          />
          <Button type="submit" disabled={isSearching}>
            {isSearching ? "Searching…" : "Search"}
          </Button>
        </form>
        {searchError && <p className="text-xs text-destructive">{searchError}</p>}
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="grid gap-4 rounded-xl border p-4">
        {isAuthenticated && (
          <div className="grid gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Your saved addresses
            </p>
            {isLoadingAddresses ? (
              <p className="text-sm text-muted-foreground">Loading addresses…</p>
            ) : addresses.length > 0 ? (
              <ul className="grid gap-1">
                {addresses.map((address) => (
                  <li key={address.id}>
                    <button
                      type="button"
                      disabled={selectingId !== null}
                      onClick={() => handleSelectAddress(address)}
                      className="flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="grid">
                        <span className="font-medium">
                          {address.name}
                          {address.isDefault && (
                            <span className="ml-2 text-xs text-muted-foreground">(default)</span>
                          )}
                        </span>
                        {address.notes && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {address.notes}
                          </span>
                        )}
                      </span>
                      {selectingId === address.id && (
                        <span className="ml-auto text-xs text-muted-foreground">Selecting…</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}

        <div className="grid gap-2">
          {isAuthenticated && addresses.length > 0 && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Or search by city / area
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a city or area"
              aria-label="Search a new location"
              autoFocus={!isAuthenticated || addresses.length === 0}
            />
            <Button type="submit" disabled={isSearching || selectingId !== null}>
              {isSearching ? "Searching…" : "Set location"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={closeEdit}
            >
              Cancel
            </Button>
          </form>
        </div>

        <Button
          type="button"
          variant="link"
          className="h-auto justify-self-start p-0 text-sm"
          onClick={() => {
            closeEdit()
            onChangeLocation()
          }}
        >
          Use my current location
        </Button>

        {searchError && <p className="text-xs text-destructive">{searchError}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <MapPinIcon className="size-4 text-primary" />
      <span className="font-medium">
        {locationLabel ?? "Locating your address…"}
      </span>
      <Button
        variant="link"
        className="h-auto p-0 text-sm"
        onClick={() => setIsEditing(true)}
      >
        Change location
      </Button>
    </div>
  )
}
