import { Outlet } from "react-router-dom"

// Centered, narrow shell for the authentication pages (login, register, ...).
export function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
