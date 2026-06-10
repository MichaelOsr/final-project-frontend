import { useEffect } from "react"
import { AppRoutes } from "@/routes/AppRoutes"
import { Toaster } from "@/components/ui/sonner"
import { useAuthStore } from "@/store/auth.store"
import { useAdminSessionStore } from "@/store/adminSession.store"

function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const fetchAdminMe = useAdminSessionStore((s) => s.fetchMe)

  // Hydrate auth state once on load: if a valid session cookie exists, /me
  // returns the user; otherwise the status settles to "unauthenticated".
  useEffect(() => {
    fetchMe()
    fetchAdminMe()
  }, [fetchMe, fetchAdminMe])

  return (
    <>
      <AppRoutes />
      <Toaster richColors position="top-center" />
    </>
  )
}

export default App
