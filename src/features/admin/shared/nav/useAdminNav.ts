import { useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { useAdminSessionStore } from "@/store/adminSession.store";
import {
  adminNavEntries,
  navGroupOrder,
  type AdminNavVisibleEntry,
  type NavGroup,
} from "./adminNav.config";

export type AdminNavLinkItem = {
  key: string;
  label: string;
  href: string;
  path: string;
  icon: LucideIcon;
  group: NavGroup;
  order: number;
  end?: boolean;
};

export function useAdminNav() {
  const { pathname, search } = useLocation();
  const admin = useAdminSessionStore((state) => state.user);
  const role = admin?.role;

  const storeId = new URLSearchParams(search).get("storeId") ?? "";
  const isStoreContext =
    pathname.startsWith("/admin/store/") ||
    (pathname.startsWith("/admin/orders") && storeId !== "");
  const activeContext: "global" | "store" = isStoreContext ? "store" : "global";

  const items: AdminNavLinkItem[] = adminNavEntries
    .filter(
      (entry): entry is AdminNavVisibleEntry =>
        entry.showInNav &&
        !!role &&
        entry.roles.includes(role) &&
        (entry.context === "any" || entry.context === activeContext)
    )
    .map((entry) => {
      const needsStoreId =
        entry.context === "store" || (entry.context === "any" && isStoreContext);
      const href =
        needsStoreId && storeId
          ? `${entry.path}?storeId=${encodeURIComponent(storeId)}`
          : entry.path;
      return {
        key: entry.key,
        label: entry.label,
        href,
        path: entry.path,
        icon: entry.icon,
        group: entry.group,
        order: entry.order,
        end: entry.end,
      };
    });

  const groups = navGroupOrder
    .map((group) => ({
      group,
      items: items
        .filter((item) => item.group === group)
        .sort((a, b) => a.order - b.order),
    }))
    .filter((g) => g.items.length > 0);

  const activeItem = items.reduce<{ key: string; label: string; len: number } | null>(
    (best, item) => {
      const matches = item.end
        ? pathname === item.path
        : pathname.startsWith(item.path);
      if (!matches) return best;
      if (!best || item.path.length > best.len) {
        return { key: item.key, label: item.label, len: item.path.length };
      }
      return best;
    },
    null
  );

  return {
    groups,
    activeKey: activeItem?.key ?? null,
    activeLabel: activeItem?.label ?? null,
    isStoreContext,
    storeId,
    role,
  };
}
