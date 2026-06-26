import { Navigate, useSearchParams } from "react-router-dom";
import { updateSearchParams } from "@/features/admin/shared/utils/searchParams";

// Keeps old deep links working after stock pages were merged into the tabbed
// /admin/store/stock page. Preserves existing query params (filters, storeId)
// and points them at the matching tab.
export function StockTabRedirect({ tab }: { tab: string }) {
  const [searchParams] = useSearchParams();
  const next = updateSearchParams(searchParams, { tab });
  return <Navigate to={`/admin/store/stock?${next.toString()}`} replace />;
}
