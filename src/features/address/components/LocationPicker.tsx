import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { geocodeService } from "@/features/home/services/geocode.service"
import { getErrorMessage } from "@/lib/error"

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})


const DEFAULT_CENTER: [number, number] = [-7.2575, 112.7521] // Surabaya
type LatLng = { lat: number; lng: number }

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => { map.setView(center) }, [center, map])
  return null
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: { lat: string; lng: string }
  onChange: (lat: string, lng: string) => void
}) {
  const hasValue = value.lat !== "" && value.lng !== ""
  const position = hasValue ? { lat: Number(value.lat), lng: Number(value.lng) } : null
  const center: [number, number] = position ? [position.lat, position.lng] : DEFAULT_CENTER

  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)

  const pick = (p: LatLng) => onChange(String(p.lat), String(p.lng))

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation is not supported")
    navigator.geolocation.getCurrentPosition(
      (pos) => pick({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error("Couldn't get your location"),
    )
  }

  const search = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const { data } = await geocodeService.getCoordinates(query)
      if (data.data) pick({ lat: data.data.lat, lng: data.data.lng })
      else toast.error("Place not found")
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <Input
          placeholder="Search a place..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void search() } }}
        />
        <Button type="button" variant="outline" onClick={() => void search()} disabled={searching}>
          {searching ? "..." : "Search"}
        </Button>
        <Button type="button" variant="outline" onClick={useMyLocation}>
          Use my location
        </Button>
      </div>

      <div className="h-64 overflow-hidden rounded-md border">
        <MapContainer center={center} zoom={13} className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={pick} />
          {position && (
            <Marker
              position={position}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = (e.target as L.Marker).getLatLng()
                  pick({ lat: ll.lat, lng: ll.lng })
                },
              }}
            />
          )}
          <Recenter center={center} />
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground">
        {hasValue
          ? `Selected: ${Number(value.lat).toFixed(5)}, ${Number(value.lng).toFixed(5)}`
          : "Click the map, search, or use your location to set the point."}
      </p>
    </div>
  )
}
