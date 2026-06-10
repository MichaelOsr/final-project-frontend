import { Loader2Icon } from "lucide-react"

// Shown while the auth status is still resolving (first /me check).
export function FullScreenLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}
