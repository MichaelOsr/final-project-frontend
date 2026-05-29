import { useEffect } from "react"
import { AppRoutes } from "@/routes/AppRoutes"
import { Toaster } from "@/components/ui/sonner"
import { useAuthStore } from "@/store/auth.store"

function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe)

  // Hydrate auth state once on load: if a valid session cookie exists, /me
  // returns the user; otherwise the status settles to "unauthenticated".
  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  return (
    <>
      <AppRoutes />
      <Toaster richColors position="top-center" />
    </>
  )
}

export default App
