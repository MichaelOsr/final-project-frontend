import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth.store"
import { FullScreenLoader } from "@/components/FullScreenLoader"

// Guards pages that only make sense when logged out (login, register, etc.).
// Already-authenticated users are sent to the homepage.
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)

  if (status === "loading") return <FullScreenLoader />
  if (status === "authenticated") return <Navigate to="/" replace />
  return <>{children}</>
}
