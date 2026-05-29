import { Outlet } from "react-router-dom"

// Centered, modal-style shell for auth pages.
export function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted px-4 py-16">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
