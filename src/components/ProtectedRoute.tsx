import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth.store"
import { FullScreenLoader } from "@/components/FullScreenLoader"
import { useEffect } from "react"
import { toast } from "sonner"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Please log in to access this page", { id: "auth-redirect" })
    } else if (status === "authenticated" && !user?.isVerified) {
      toast.error("Please verify your email before accessing this page", { id: "auth-redirect" })
    }
  }, [status, user])

  if (status === "loading") return <FullScreenLoader />
  if (status === "unauthenticated") return <Navigate to="/" replace />
  if (status === "authenticated" && !user?.isVerified) return <Navigate to="/" replace />

  return <>{children}</>
}
