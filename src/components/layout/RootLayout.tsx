import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"

// Shell for the main app pages (homepage, profile, ...): navbar + footer.
export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GrocerGo. All rights reserved.
      </footer>
    </div>
  )
}
