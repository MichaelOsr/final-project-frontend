import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LogOutIcon,
  UserIcon,
  ClipboardListIcon,
  MenuIcon,
  ShoppingBasketIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchBar, MobileSearchButton } from "@/components/layout/SearchBar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import type { User } from "@/types/user.types";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
        <DropdownMenuItem asChild>
          <Link to="/orders">
            <ClipboardListIcon /> Pesanan Saya
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onLogout}>
          <LogOutIcon /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const totalItems = useCartStore((s) => s.totalItems);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCart();
    }
  }, [status, fetchCart]);

  const handleLogout = async () => {
    await logout();
    clearCart();
    toast.success("Signed out");
    navigate("/login");
  };

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
        <SearchBar />

        {/* Mobile-only search button, sits next to the cart */}
        <MobileSearchButton />

        {/* Cart icon + badge */}
        <Link
          to={status === "authenticated" ? "/cart" : "/login"}
          className="relative rounded-full p-2 text-foreground transition-colors hover:bg-muted md:ml-auto"
          aria-label={`Cart${totalItems > 0 ? `, ${totalItems} item` : ""}`}
        >
          <ShoppingCartIcon className="size-5" />
          {status === "authenticated" && totalItems > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Link>

        {/* Auth zone */}
        {status === "authenticated" && user ? (
          <UserMenu user={user} onLogout={handleLogout} />
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="rounded-full"
              size="sm"
            >
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-full" size="sm">
              <Link to="/register">Sign up</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
