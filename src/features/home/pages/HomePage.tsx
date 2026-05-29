import { usePageTitle } from "@/hooks/usePageTitle"
import { useAuthStore } from "@/store/auth.store"

// Placeholder homepage. The full landing page (hero, product list by nearest
// store, etc.) is a separate Feature 1 task and lives in this `home` feature.
export function HomePage() {
  usePageTitle("Home")
  const user = useAuthStore((s) => s.user)
  return (
    <div className="grid gap-2 py-10 text-center">
      <h1 className="text-2xl font-semibold">
        {user ? `Welcome back, ${user.name}` : "Welcome to GrocerGo"}
      </h1>
      <p className="text-muted-foreground">Fresh groceries from the store nearest to you.</p>
    </div>
  )
}
