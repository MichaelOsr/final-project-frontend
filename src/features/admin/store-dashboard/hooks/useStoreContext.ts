import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { updateSearchParams } from "@/features/admin/shared/utils/searchParams";

export function useStoreContext() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const admin = useAdminSessionStore((state) => state.user);
  const lastAccessedStoreId = useAdminSessionStore((state) => state.lastAccessedStoreId);
  const setLastAccessedStoreId = useAdminSessionStore((state) => state.setLastAccessedStoreId);

  const isStoreAdmin = admin?.role === "storeAdmin";
  const queryStoreId = searchParams.get("storeId");
  const storeId = isStoreAdmin ? admin?.store?.id ?? "" : queryStoreId ?? lastAccessedStoreId ?? "";

  useEffect(() => {
    if (!storeId) {
      if (!isStoreAdmin) navigate("/admin/stores", { replace: true });
      return;
    }
    setLastAccessedStoreId(storeId);
    if (queryStoreId !== storeId) {
      setSearchParams(updateSearchParams(searchParams, { storeId }), { replace: true });
    }
  }, [storeId, isStoreAdmin, queryStoreId, searchParams, navigate, setSearchParams, setLastAccessedStoreId]);

  return { storeId, isStoreAdmin, isReady: Boolean(storeId) };
}
