import { useEffect, useState } from "react";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { adminOptionsService } from "../services/adminOptions.service";
import type { StoreOption } from "../types/admin.types";

type Resolved = { storeId: string; name: string | null };

// AdminDashboardShell (and this hook with it) is mounted fresh on every page
// navigation — each admin page renders its own shell rather than sharing one
// layout instance. Without this module-level cache, the store list would be
// re-fetched from scratch on every single page change. The list itself is
// the same for every super admin and rarely changes mid-session, so caching
// it here (until a hard reload clears the module) is safe.
let storesCache: StoreOption[] | null = null;
let storesPromise: Promise<StoreOption[]> | null = null;

function fetchStoresOnce(): Promise<StoreOption[]> {
  if (storesCache) return Promise.resolve(storesCache);
  if (!storesPromise) {
    storesPromise = adminOptionsService
      .listStores()
      .then((res) => {
        const data = res.data.data ?? [];
        storesCache = data;
        return data;
      })
      .catch((error) => {
        storesPromise = null;
        throw error;
      });
  }
  return storesPromise;
}

function resolveFromCache(storeId: string): Resolved | null {
  if (!storesCache) return null;
  const match = storesCache.find((store) => store.id === storeId);
  return { storeId, name: match?.name || null };
}

/**
 * Resolves the display name of the store currently being managed.
 * - Store admins already know their own store from the session.
 * - Super admins only carry a storeId in the URL, so their store name is
 *   looked up from the (cached) stores list.
 *
 * Return value:
 * - `undefined` — not in store context, or a super admin's lookup for the
 *   current storeId hasn't settled yet (show a loading state).
 * - `null` — the lookup finished but the store name couldn't be resolved
 *   (request failed or storeId not found — do NOT keep showing "loading").
 * - `string` — the resolved store name.
 */
export function useActiveStoreLabel(
  isStoreContext: boolean,
  storeId: string
): string | null | undefined {
  const admin = useAdminSessionStore((state) => state.user);
  const isSuperAdmin = admin?.role === "superAdmin";
  const shouldFetch = isStoreContext && isSuperAdmin && storeId !== "";

  // Lazy init reads the cache synchronously so a super admin revisiting a
  // store they already viewed this session sees the name on first paint —
  // no "Loading store…" flash on every page change.
  const [resolved, setResolved] = useState<Resolved | null>(() =>
    shouldFetch ? resolveFromCache(storeId) : null
  );

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;
    fetchStoresOnce()
      .then((stores) => {
        if (cancelled) return;
        const match = stores.find((store) => store.id === storeId);
        setResolved({ storeId, name: match?.name || null });
      })
      .catch(() => {
        if (!cancelled) setResolved({ storeId, name: null });
      });
    return () => {
      cancelled = true;
    };
  }, [shouldFetch, storeId]);

  if (!isStoreContext) return undefined;
  if (admin?.role === "storeAdmin") return admin.store?.name || null;
  if (!shouldFetch) return undefined;
  if (resolved?.storeId !== storeId) return undefined;
  return resolved.name;
}
