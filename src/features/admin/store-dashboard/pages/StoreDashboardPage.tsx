import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { StoreIcon, UserCheckIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { formatDate, formatNumber, getInitials } from "@/features/admin/shared/utils/adminFormat";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { storeDashboardService } from "../services/storeDashboard.service";
import type { StoreDashboardSummary } from "../types/storeDashboard.types";

export function StoreDashboardPage() {
  usePageTitle("Store dashboard");
  const [searchParams] = useSearchParams();
  const admin = useAdminSessionStore((state) => state.user);
  const storeId = searchParams.get("storeId") ?? "";
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<StoreDashboardSummary | null>(null);
  const access = useMemo(() => validateStoreAccess(admin?.role, admin?.store?.id, storeId), [admin, storeId]);

  useEffect(() => {
    if (!access.allowed) {
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
  }, [access.allowed, storeId]);

  if (!access.allowed) {
    return (
      <AdminDashboardShell>
        <AccessMessage message={access.message} />
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
      {!isLoading && summary ? <StoreDashboardContent summary={summary} /> : null}
    </AdminDashboardShell>
  );
}

function StoreDashboardContent({ summary }: { summary: StoreDashboardSummary }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<StoreIcon className="size-5" />} label="Store" value={summary.store.name} />
        <MetricCard icon={<UsersIcon className="size-5" />} label="Store admins" value={formatNumber(summary.metrics.totalStoreAdmins)} />
        <MetricCard icon={<UserCheckIcon className="size-5" />} label="Verified admins" value={formatNumber(summary.metrics.totalVerifiedStoreAdmins)} />
      </div>
      <section className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <StoreProfile summary={summary} />
        <StoreAdminsTable admins={summary.storeAdmins} />
      </section>
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

function StoreAdminsTable({ admins }: { admins: StoreDashboardSummary["storeAdmins"] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Assigned store admins</h2>
      </div>
      <div className="divide-y divide-border">
        {admins.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No store admins found.</p> : null}
        {admins.map((admin) => (
          <div key={admin.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar><AvatarImage src={admin.avatar ?? undefined} alt={admin.name} /><AvatarFallback>{getInitials(admin.name)}</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{admin.name}</p>
              <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
            </div>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">
              {admin.isVerified ? "Verified" : "Pending"}
            </span>
          </div>
        ))}
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

function validateStoreAccess(role: string | undefined, userStoreId: string | undefined, requestedStoreId: string) {
  if (!requestedStoreId) return { allowed: false, message: "Store ID is required to open this dashboard." };
  if (role === "superAdmin") return { allowed: true, message: "" };
  if (role !== "storeAdmin") return { allowed: false, message: "Only admin users can access store dashboards." };
  if (!userStoreId) return { allowed: false, message: "This store admin is not assigned to a store." };
  if (userStoreId !== requestedStoreId) return { allowed: false, message: "You can only access your assigned store dashboard." };
  return { allowed: true, message: "" };
}
