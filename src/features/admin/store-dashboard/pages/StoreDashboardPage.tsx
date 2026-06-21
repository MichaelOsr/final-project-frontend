import { useEffect, useState, type ReactNode } from "react";
import { StoreIcon, UserCheckIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { formatDate, formatNumber } from "@/features/admin/shared/utils/adminFormat";
import { storeDashboardService } from "../services/storeDashboard.service";
import { StoreStockList } from "../components/StoreStockList";
import { useStoreContext } from "../hooks/useStoreContext";
import type { StoreDashboardSummary } from "../types/storeDashboard.types";

export function StoreDashboardPage() {
  usePageTitle("Store dashboard");
  const { storeId, isStoreAdmin, isReady } = useStoreContext();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<StoreDashboardSummary | null>(null);

  useEffect(() => {
    if (!isReady) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    async function loadSummary() {
      try {
        const response = await storeDashboardService.getSummary(storeId);
        if (isMounted) setSummary(response.data.data ?? null);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSummary();
    return () => {
      isMounted = false;
    };
  }, [isReady, storeId]);

  if (!isReady && isStoreAdmin) {
    return (
      <AdminDashboardShell>
        <AccessMessage message="This store admin is not assigned to a store yet." />
      </AdminDashboardShell>
    );
  }

  return (
    <AdminDashboardShell>
      <div>
        <h1 className="text-xl font-semibold">Store Dashboard</h1>
        <p className="text-sm text-muted-foreground">{summary?.store.name ?? "Store overview and assigned admins."}</p>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading store dashboard...</p> : null}
      {!isLoading && summary ? <StoreDashboardContent summary={summary} storeId={storeId} /> : null}
    </AdminDashboardShell>
  );
}

function StoreDashboardContent({ summary, storeId }: { summary: StoreDashboardSummary; storeId: string }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<StoreIcon className="size-5" />} label="Store" value={summary.store.name} />
        <MetricCard icon={<UsersIcon className="size-5" />} label="Store admins" value={formatNumber(summary.metrics.totalStoreAdmins)} />
        <MetricCard icon={<UserCheckIcon className="size-5" />} label="Verified admins" value={formatNumber(summary.metrics.totalVerifiedStoreAdmins)} />
      </div>
      <StoreProfile summary={summary} />
      <StoreStockList storeId={storeId} />
    </div>
  );
}

function StoreProfile({ summary }: { summary: StoreDashboardSummary }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <h2 className="text-sm font-semibold">Store profile</h2>
      <div className="mt-4 grid gap-3 text-sm">
        <InfoRow label="Latitude" value={summary.store.latitude ?? "-"} />
        <InfoRow label="Longitude" value={summary.store.longitude ?? "-"} />
        <InfoRow label="Created" value={formatDate(summary.store.createdAt)} />
        <InfoRow label="Updated" value={formatDate(summary.store.updatedAt)} />
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="mb-3 text-primary">{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function AccessMessage({ message }: { message: string }) {
  return <div className="rounded-lg border border-border bg-background p-6 text-sm text-muted-foreground">{message}</div>;
}
