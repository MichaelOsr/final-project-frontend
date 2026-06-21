import { useState } from "react"
import { MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/error"
import type { LocationStatus } from "@/store/location.store"

interface LocationBannerProps {
  status: LocationStatus
  storeName: string | null
  locationLabel: string | null
  error: string | null
  onChangeLocation: () => void
  onSearch: (query: string) => Promise<void>
}

export function LocationBanner({
  status,
  storeName,
  locationLabel,
  error,
  onChangeLocation,
  onSearch,
}: LocationBannerProps) {
  const [query, setQuery] = useState("")
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

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
    } catch (err) {
      setSearchError(getErrorMessage(err, "We couldn't find that location."))
    } finally {
      setIsSearching(false)
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

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <MapPinIcon className="size-4 text-primary" />
      <span className="text-muted-foreground">
        {status === "denied" ? "Showing products from" : "Showing products near"}
      </span>
      <span className="font-medium">{locationLabel ?? storeName}</span>
      <Button
        variant="link"
        className="h-auto p-0 text-sm"
        onClick={onChangeLocation}
      >
        Change location
      </Button>
    </div>
  )
}
