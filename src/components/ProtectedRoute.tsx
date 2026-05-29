import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/auth.store"
import { FullScreenLoader } from "@/components/FullScreenLoader"

// Guards pages that require authentication. While the first /me check is in
// flight we show a loader so a logged-in user isn't briefly bounced to /login.
// On redirect we remember the current location so login can return the user here.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()

  if (status === "loading") return <FullScreenLoader />
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <>{children}</>
}
