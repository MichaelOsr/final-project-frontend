import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { LogOutIcon, UserIcon, SearchIcon, MenuIcon, ShoppingBasketIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/auth.store"
import type { User } from "@/types/user.types"

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar>
            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserIcon /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onLogout}>
          <LogOutIcon /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Navbar() {
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success("Signed out")
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        {/* Hamburger — placeholder for future sidebar */}
        <button
          className="rounded-md p-1.5 text-foreground hover:bg-muted md:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="size-5" />
        </button>

        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-1.5">
          <ShoppingBasketIcon className="size-6 text-primary" />
          <span className="text-base font-bold tracking-tight">GrocerGo</span>
        </Link>

        {/* Search bar: hidden on mobile, visible on md+ */}
        <div className="relative hidden flex-1 items-center md:flex">
          <SearchIcon className="absolute left-3.5 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search products and stores"
            className="h-10 w-full rounded-full border border-input bg-muted/50 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            readOnly
          />
        </div>

        {/* Auth zone */}
        {status === "authenticated" && user ? (
          <div className="ml-auto">
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        ) : (
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button asChild variant="outline" className="rounded-full" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-full" size="sm">
              <Link to="/register">Sign up</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  )
}
