import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { getPageParam, updateSearchParams } from "@/features/admin/shared/utils/searchParams";
import { useStoreContext } from "@/features/admin/store-dashboard/hooks/useStoreContext";
import { discountService } from "../services/promo.service";
import type { Discount, DiscountSortField, DiscountType } from "../types/promo.types";
import { DiscountFilters } from "../components/DiscountFilters";
import { DiscountsTable } from "../components/DiscountsTable";
import { DeleteDiscountDialog } from "../components/DeleteDiscountDialog";

const DEFAULT_META: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

export function StoreDiscountsPage() {
  usePageTitle("Discounts");
  const navigate = useNavigate();
  const { storeId, isReady } = useStoreContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const page = getPageParam(searchParams);
  const q = searchParams.get("q") ?? "";
  const type = (searchParams.get("type") ?? "") as DiscountType | "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const sortBy = (searchParams.get("sortBy") ?? "createdAt") as DiscountSortField;
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

  useEffect(() => {
    if (!isReady) return;
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const res = await discountService.list({
          storeId, page, limit: 10, sortBy, sortOrder,
          ...(q ? { q } : {}),
          ...(type ? { type } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        });
        if (!mounted) return;
        setDiscounts(res.data.data ?? []);
        setMeta(res.data.meta ?? DEFAULT_META);
      } catch (error) {
        if (mounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [isReady, storeId, page, q, type, startDate, endDate, sortBy, sortOrder]);

  function updateFilters(updates: Record<string, string | number>) {
    setSearchParams(updateSearchParams(searchParams, updates));
  }

  function handleSort(field: DiscountSortField, order: "asc" | "desc") {
    updateFilters({ sortBy: field, sortOrder: order, page: 1 });
  }

  function openEdit(d: Discount) {
    navigate(`/admin/store/discounts/${d.id}/edit`);
  }

  function openDelete(d: Discount) {
    setDeleteTarget(d);
    setIsDeleteOpen(true);
  }

  return (
    <AdminDashboardShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Discounts</h1>
          <p className="text-sm text-muted-foreground">Manage product discounts for this store.</p>
        </div>
        <Button asChild>
          <Link to="/admin/store/discounts/new">
            <PlusIcon className="size-4" />
            New Discount
          </Link>
        </Button>
      </div>

      <Card className="rounded-lg p-0">
        <CardContent className="overflow-hidden p-0">
          <DiscountFilters q={q} type={type} startDate={startDate} endDate={endDate} onChange={updateFilters} />
          <DiscountsTable
            discounts={discounts}
            isLoading={isLoading}
            meta={meta}
            page={page}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onPageChange={(p) => updateFilters({ page: p })}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        </CardContent>
      </Card>

      <DeleteDiscountDialog
        open={isDeleteOpen}
        discount={deleteTarget}
        onOpenChange={setIsDeleteOpen}
        onDeleted={(id) => setDiscounts((prev) => prev.filter((d) => d.id !== id))}
      />
    </AdminDashboardShell>
  );
}
