import { usePageTitle } from "@/hooks/usePageTitle"
import { useLocation } from "@/features/home/hooks/useLocation"
import { useAuthStore } from "@/store/auth.store"
import { HeroCarousel } from "@/features/home/components/HeroCarousel"
import { LocationBanner } from "@/features/home/components/LocationBanner"
import { ProductGrid } from "@/features/home/components/ProductGrid"

export function HomePage() {
  usePageTitle("Home")
  const {
    status,
    storeId,
    storeName,
    locationLabel,
    error,
    requestLocation,
    searchManualLocation,
    selectFromAddress,
  } = useLocation()
  const isAuthenticated = useAuthStore((s) => s.status === "authenticated")

  return (
    <div>
      <HeroCarousel />

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 grid gap-4">
          <h2 className="text-2xl font-bold">
            Store Near You{storeName ? ` : ${storeName}` : ""}
          </h2>
          <LocationBanner
            status={status}
            storeName={storeName}
            locationLabel={locationLabel}
            error={error}
            onChangeLocation={requestLocation}
            onSearch={searchManualLocation}
            isAuthenticated={isAuthenticated}
            onSelectAddress={selectFromAddress}
          />
        </div>

        <ProductGrid storeId={storeId} />
      </section>
    </div>
  )
}
