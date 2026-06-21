import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

// Background photos are from Unsplash (free to use). The `auto=format&fit=crop`
// params let Unsplash serve an optimized, correctly-cropped image.
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1600&q=80&auto=format&fit=crop`

const slides = [
  {
    title: "Order groceries for delivery or pickup today",
    subtitle: "Fresh groceries from the store nearest to you — delivered fast.",
    cta: { label: "Shop now", to: "/products" },
    image: UNSPLASH("1553531889-56cc480ac5cb"),
  },
  {
    title: "Get $0 delivery on your first 3 orders",
    subtitle: "Sign up today and start saving on every basket.",
    cta: { label: "Sign up free", to: "/register" },
    image: UNSPLASH("1542838132-92c53300491e"),
  },
  {
    title: "Best local stores, handpicked for you",
    subtitle: "We partner with the top grocery stores in your area.",
    cta: { label: "Browse products", to: "/products" },
    image: UNSPLASH("1557844352-761f2565b576"),
  },
]

export function HeroCarousel() {
  const [api, setApi] = useState<CarouselApi>()

  // Auto-advance every 5s; clean up the timer when the api/component changes.
  useEffect(() => {
    if (!api) return
    const interval = setInterval(() => api.scrollNext(), 5000)
    return () => clearInterval(interval)
  }, [api])

  return (
    <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.title}>
            <div
              className="relative bg-emerald-900 bg-cover bg-center text-white"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Dark gradient overlay keeps the white text readable over photos. */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/20" />
              <div className="relative mx-auto grid max-w-5xl gap-5 px-6 py-20 md:py-28">
                <h2 className="max-w-2xl text-3xl font-bold leading-tight drop-shadow md:text-5xl">
                  {slide.title}
                </h2>
                <p className="max-w-xl text-lg text-white/90 drop-shadow">
                  {slide.subtitle}
                </p>
                <div>
                  <Button
                    asChild
                    className="h-12 rounded-full bg-white px-8 text-base font-semibold text-primary hover:bg-white/90 [a]:hover:bg-white/90 [a]:hover:text-primary"
                  >
                    <Link to={slide.cta.to}>{slide.cta.label}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 hidden md:flex" />
      <CarouselNext className="right-4 hidden md:flex" />
    </Carousel>
  )
}
