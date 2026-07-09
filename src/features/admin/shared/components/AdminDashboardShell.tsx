import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  Building2Icon,
  Loader2Icon,
  LogOutIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { getInitials } from "../utils/adminFormat";
import { AdminErrorBoundary } from "./AdminErrorBoundary";
import { useAdminNav } from "../nav/useAdminNav";
import { useActiveStoreLabel } from "../hooks/useActiveStoreLabel";
import type { NavGroup } from "../nav/adminNav.config";

const groupLabels: Record<NavGroup, string> = {
  overview: "Overview",
  catalog: "Catalog",
  sales: "Sales",
  promotions: "Promotions",
  reports: "Reports",
  admin: "Admin",
};

function Sidebar() {
  const { groups, activeKey, isStoreContext, role } = useAdminNav();

  return (
    <aside
      aria-label="Admin navigation"
      className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-border bg-background lg:block"
    >
      <div className="flex h-14 items-center border-b border-border px-5">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2Icon className="size-4" />
          </span>
          GrocerGo Dashboard
        </div>
      </div>
      <nav className="grid gap-1 p-3">
        {role === "superAdmin" && isStoreContext && (
          <Link
            to="/admin/dashboard"
            className="mb-2 flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            Back to Dashboard
          </Link>
        )}
        {groups.map(({ group, items }) => (
          <div key={group} className="mb-1">
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
              {groupLabels[group]}
            </p>
            {items.map(({ key, label, href, icon: Icon }) => {
              const isActive = activeKey === key;
              return (
                <Link
                  key={key}
                  to={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function MobileNav() {
  const { groups, activeKey, isStoreContext, role } = useAdminNav();
  const items = groups.flatMap((g) => g.items);

  return (
    <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 lg:hidden">
      {role === "superAdmin" && isStoreContext && (
        <Link
          to="/admin/dashboard"
          className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Dashboard
        </Link>
      )}
      {items.map(({ key, label, href, icon: Icon }) => {
        const isActive = activeKey === key;
        return (
          <Link
            key={key}
            to={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              isActive && "bg-accent text-accent-foreground"
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
  const { activeLabel, isStoreContext, storeId } = useAdminNav();
  const storeLabel = useActiveStoreLabel(isStoreContext, storeId);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    navigate("/admin/login", { replace: true });
  }

  const heading = isStoreContext
    ? (storeLabel === undefined ? "Loading store…" : storeLabel ?? "Store")
    : admin?.role === "storeAdmin"
      ? "Store Admin Dashboard"
      : "Super Admin Dashboard";
  const subheading =
    activeLabel ??
    (isStoreContext ? "Store admin area" : "Platform overview and recent activity");

  return (
    <div className="min-h-svh bg-muted/40 text-foreground">
      <Sidebar />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div>
              <p className="text-sm font-semibold">{heading}</p>
              <p className="text-xs text-muted-foreground">{subheading}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{admin?.name ?? "Admin"}</p>
                <p className="text-xs text-muted-foreground">{admin?.role}</p>
              </div>
              <Avatar>
                <AvatarImage
                  src={admin?.avatar ?? undefined}
                  alt={admin?.name}
                />
                <AvatarFallback>{getInitials(admin?.name)}</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <LogOutIcon className="size-4" />
                )}
                Logout
              </Button>
            </div>
          </div>
          <MobileNav />
        </header>
        <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-5 sm:px-6">
          <AdminErrorBoundary>{children}</AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
