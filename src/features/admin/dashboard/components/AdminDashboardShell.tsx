import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2Icon,
  LayoutDashboardIcon,
  Loader2Icon,
  LogOutIcon,
  StoreIcon,
  UserCogIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminSessionStore } from "@/store/adminSession.store";
import type { IAdminSessionUser } from "@/types/adminAuthStore.types";
import { getAdminLandingPath } from "@/features/admin/auth/utils/adminRouting";
import { getInitials } from "../utils/dashboardFormat";

const superAdminNavItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboardIcon },
  { label: "Stores", to: "/admin/stores", icon: StoreIcon },
  { label: "Accounts", to: "/admin/admin-accounts", icon: UserCogIcon },
];

function Sidebar() {
  const admin = useAdminSessionStore((state) => state.user);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-border bg-background lg:block">
      <div className="flex h-14 items-center border-b border-border px-5">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2Icon className="size-4" />
          </span>
          Grocery Admin
        </div>
      </div>
      <DashboardNav className="grid gap-1 p-3" admin={admin} />
    </aside>
  );
}

function DashboardNav({ admin, className }: { admin: IAdminSessionUser | null; className: string }) {
  const { pathname } = useLocation();
  const navItems = admin?.role === "storeAdmin"
    ? [{ label: "Dashboard", to: getAdminLandingPath(admin), icon: LayoutDashboardIcon }]
    : superAdminNavItems;

  return (
    <nav className={className}>
      {navItems.map(({ label, to, icon: Icon }) => {
        const isActive = to === "/admin/dashboard" ? pathname === to : pathname.startsWith(to);

        return (
          <Link
            key={label}
            to={to}
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              isActive && "bg-accent text-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const admin = useAdminSessionStore((state) => state.user);
  const logout = useAdminSessionStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-svh bg-muted/40 text-foreground">
      <Sidebar />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div>
              <p className="text-sm font-semibold">{admin?.role === "storeAdmin" ? "Store Admin Dashboard" : "Super Admin Dashboard"}</p>
              <p className="text-xs text-muted-foreground">
                Platform overview and recent activity
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{admin?.name ?? "Admin"}</p>
                <p className="text-xs text-muted-foreground">{admin?.role}</p>
              </div>
              <Avatar>
                <AvatarImage src={admin?.avatar ?? undefined} alt={admin?.name} />
                <AvatarFallback>{getInitials(admin?.name)}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? <Loader2Icon className="size-4 animate-spin" /> : <LogOutIcon className="size-4" />}
                Logout
              </Button>
            </div>
          </div>
          <DashboardNav admin={admin} className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 lg:hidden" />
        </header>
        <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-5 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
