import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { updateSearchParams } from "@/features/admin/shared/utils/searchParams";

export function useStoreContext() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const admin = useAdminSessionStore((state) => state.user);

  const isStoreAdmin = admin?.role === "storeAdmin";
  const queryStoreId = searchParams.get("storeId");
  // No cross-request/cross-tab fallback: a super admin's active store comes
  // strictly from the URL. Falling back to a remembered store here previously
  // caused a store viewed in one tab to silently leak into another tab (or a
  // later visit) that had no storeId of its own.
  const storeId = isStoreAdmin ? admin?.store?.id ?? "" : queryStoreId ?? "";

  useEffect(() => {
    if (!storeId) {
      if (!isStoreAdmin) navigate("/admin/stores", { replace: true });
      return;
    }
    if (queryStoreId !== storeId) {
      setSearchParams(updateSearchParams(searchParams, { storeId }), { replace: true });
    }
  }, [storeId, isStoreAdmin, queryStoreId, searchParams, navigate, setSearchParams]);

  return { storeId, isStoreAdmin, isReady: Boolean(storeId) };
}
