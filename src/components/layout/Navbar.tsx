import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { LogOutIcon, UserIcon } from "lucide-react"
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
    <header className="border-b">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="text-base font-semibold">
          GrocerGo
        </Link>
        {status === "authenticated" && user ? (
          <UserMenu user={user} onLogout={handleLogout} />
        ) : (
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">Sign up</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  )
}
