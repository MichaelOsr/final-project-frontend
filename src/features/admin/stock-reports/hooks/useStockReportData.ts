import { useEffect, useRef, useState } from "react";
import { useReportError } from "@/features/admin/shared/hooks/useReportError";
import type {
  PaginationMeta,
  ResolvedRange,
} from "@/features/admin/shared/types/admin.types";
import { adminCategoryService } from "@/features/admin/categories/services/adminCategory.service";
import type { AdminCategory } from "@/features/admin/categories/types/adminCategory.types";
import { stockReportService } from "../services/stockReport.service";
import type {
  StockReportItem,
  StockReportQuery,
  StockReportSummary,
} from "../types/stockReport.types";

const DEFAULT_LIMIT = 10;
const DEFAULT_META: PaginationMeta = { page: 1, limit: DEFAULT_LIMIT, total: 0, totalPages: 1 };

// Fetches categories (for the filter dropdown) and the stock report itself.
// Guards against out-of-order responses: if filters change again before a
// slower, earlier request resolves, that stale response must not overwrite
// newer data (a plain "mounted" flag only protects against unmount, not
// against an older still-mounted request resolving after a newer one).
export function useStockReportData(query: StockReportQuery, isActive: boolean) {
  const handleError = useReportError();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [items, setItems] = useState<StockReportItem[]>([]);
  const [summary, setSummary] = useState<StockReportSummary | null>(null);
  const [range, setRange] = useState<ResolvedRange | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [isLoading, setIsLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    adminCategoryService
      .list({ page: 1, limit: 100 })
      .then((res) => setCategories(res.data.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const requestId = ++requestIdRef.current;
    load(requestId);

    async function load(currentId: number) {
      setIsLoading(true);
      setForbidden(false);
      try {
        const res = await stockReportService.report(query);
        if (currentId !== requestIdRef.current) return;
        setItems(res.data.data.items);
        setSummary(res.data.data.summary);
        setRange(res.data.data.filters.resolvedRange);
        setMeta(res.data.meta);
      } catch (error) {
        if (currentId !== requestIdRef.current) return;
        if (handleError(error) === "forbidden") setForbidden(true);
      } finally {
        if (currentId === requestIdRef.current) setIsLoading(false);
      }
    }
  }, [isActive, query, handleError]);

  return { categories, items, summary, range, meta, isLoading, forbidden };
}
