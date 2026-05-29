import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"

// Pages manage their own max-width / padding so the hero section can go full-width.
export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GrocerGo. All rights reserved.
      </footer>
    </div>
  )
}
