import { Link } from "react-router-dom"
import { ShoppingBasketIcon, TruckIcon, StoreIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePageTitle } from "@/hooks/usePageTitle"
import { useAuthStore } from "@/store/auth.store"

const features = [
  {
    icon: ShoppingBasketIcon,
    title: "Shop your favorites",
    description: "Browse thousands of products from the store nearest to your location.",
  },
  {
    icon: TruckIcon,
    title: "Fast delivery",
    description: "Get groceries delivered to your door — sometimes in under an hour.",
  },
  {
    icon: StoreIcon,
    title: "Best local stores",
    description: "We partner with the top grocery stores in your area for the best selection.",
  },
]

export function HomePage() {
  usePageTitle("Home")
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      {/* Hero section */}
      <section className="bg-hero text-white">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2">
          <div className="grid gap-6">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              {user ? `Welcome back, ${user.name}` : "Order groceries for delivery or pickup today"}
            </h1>
            <p className="text-lg text-white/80">
              Fresh groceries from the store nearest to you — delivered fast.
            </p>
            <div>
              {status === "authenticated" ? (
                <Button
                  asChild
                  className="h-12 rounded-full bg-primary px-8 text-base font-semibold text-white hover:bg-primary/90"
                >
                  <Link to="/products">Shop now</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="h-12 rounded-full bg-primary px-8 text-base font-semibold text-white hover:bg-primary/90"
                >
                  <Link to="/register">Sign up to get $0 delivery fee</Link>
                </Button>
              )}
              {status !== "authenticated" && (
                <p className="mt-2 text-xs text-white/60">
                  *Valid for first 3 orders. Service fees and terms apply.
                </p>
              )}
            </div>
          </div>

          {/* Placeholder visual — replace with real image when available */}
          <div className="hidden items-center justify-center rounded-2xl bg-white/10 p-10 md:flex">
            <ShoppingBasketIcon className="size-32 text-white/40" />
          </div>
        </div>
      </section>

      {/* Feature cards section */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-10 text-center text-2xl font-bold">
            Grocery delivery you can count on
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="grid gap-3 rounded-xl bg-muted p-6">
                <Icon className="size-8 text-primary" />
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
