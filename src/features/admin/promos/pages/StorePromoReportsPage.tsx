import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import { useStoreContext } from "@/features/admin/store-dashboard/hooks/useStoreContext";
import { promoReportService } from "../services/promo.service";
import type { DiscountReportItem, DiscountReportSummary } from "../types/promo.types";
import type { VoucherReportItem, VoucherReportSummary, VoucherType } from "../types/voucher.types";
import { DiscountReportFilters } from "../components/DiscountReportFilters";
import { DiscountReportPanel } from "../components/DiscountReportPanel";
import { VoucherReportFilters } from "../components/VoucherReportFilters";
import { VoucherReportPanel } from "../components/VoucherReportPanel";

const DEFAULT_META: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };
type Tab = "discounts" | "vouchers";

const TAB_CLASS = (active: boolean) =>
  `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
    active
      ? "border-primary text-primary"
      : "border-transparent text-muted-foreground hover:text-foreground"
  }`;

export function StorePromoReportsPage() {
  usePageTitle("Promo Reports");
  const { storeId, isReady } = useStoreContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = ((searchParams.get("tab") ?? "discounts") === "vouchers" ? "vouchers" : "discounts") as Tab;

  const page = getPageParam(searchParams);
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const voucherType = (searchParams.get("voucherType") ?? "") as VoucherType | "";

  const [isLoadingD, setIsLoadingD] = useState(true);
  const [discountSummary, setDiscountSummary] = useState<DiscountReportSummary | null>(null);
  const [discountItems, setDiscountItems] = useState<DiscountReportItem[]>([]);
  const [discountMeta, setDiscountMeta] = useState(DEFAULT_META);

  const [isLoadingV, setIsLoadingV] = useState(true);
  const [voucherSummary, setVoucherSummary] = useState<VoucherReportSummary | null>(null);
  const [voucherItems, setVoucherItems] = useState<VoucherReportItem[]>([]);
  const [voucherMeta, setVoucherMeta] = useState(DEFAULT_META);

  useEffect(() => {
    if (!isReady || tab !== "discounts") return;
    let mounted = true;
    async function load() {
      setIsLoadingD(true);
      try {
        const res = await promoReportService.discounts({
          storeId, page, limit: 10,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        });
        if (!mounted) return;
        setDiscountSummary(res.data.data?.summary ?? null);
        setDiscountItems(res.data.data?.items ?? []);
        setDiscountMeta(res.data.meta ?? DEFAULT_META);
      } catch (error) {
        if (mounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (mounted) setIsLoadingD(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [isReady, storeId, tab, page, startDate, endDate]);

  useEffect(() => {
    if (!isReady || tab !== "vouchers") return;
    let mounted = true;
    async function load() {
      setIsLoadingV(true);
      try {
        const res = await promoReportService.vouchers({
          storeId, page, limit: 10,
          ...(voucherType ? { voucherType } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        });
        if (!mounted) return;
        setVoucherSummary(res.data.data?.summary ?? null);
        setVoucherItems(res.data.data?.items ?? []);
        setVoucherMeta(res.data.meta ?? DEFAULT_META);
      } catch (error) {
        if (mounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (mounted) setIsLoadingV(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [isReady, storeId, tab, page, voucherType, startDate, endDate]);

  function updateFilters(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  function switchTab(t: Tab) {
    setSearchParams(updateSearchParams(searchParams, { tab: t, page: 1, startDate: "", endDate: "", voucherType: "" }));
  }

  return (
    <AdminDashboardShell>
      <div>
        <h1 className="text-xl font-semibold">Promo Reports</h1>
        <p className="text-sm text-muted-foreground">Discount and voucher usage history for this store.</p>
      </div>

      <div className="flex border-b border-border">
        <button className={TAB_CLASS(tab === "discounts")} onClick={() => switchTab("discounts")}>Discounts</button>
        <button className={TAB_CLASS(tab === "vouchers")} onClick={() => switchTab("vouchers")}>Vouchers</button>
      </div>

      <Card className="rounded-lg p-0">
        <CardContent className="overflow-hidden p-0">
          {tab === "discounts" && (
            <>
              <DiscountReportFilters startDate={startDate} endDate={endDate} onChange={updateFilters} />
              <div className="p-4">
                <DiscountReportPanel
                  summary={discountSummary}
                  items={discountItems}
                  isLoading={isLoadingD}
                  meta={discountMeta}
                  onPageChange={(p) => updateFilters({ page: p })}
                />
              </div>
            </>
          )}
          {tab === "vouchers" && (
            <>
              <VoucherReportFilters voucherType={voucherType} startDate={startDate} endDate={endDate} onChange={updateFilters} />
              <div className="p-4">
                <VoucherReportPanel
                  summary={voucherSummary}
                  items={voucherItems}
                  isLoading={isLoadingV}
                  meta={voucherMeta}
                  onPageChange={(p) => updateFilters({ page: p })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AdminDashboardShell>
  );
}
