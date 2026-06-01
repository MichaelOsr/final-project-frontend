import {
  BadgeCheckIcon,
  Building2Icon,
  ShieldCheckIcon,
  StoreIcon,
  UserCogIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "../utils/dashboardFormat";
import type { DashboardSummary } from "../types/adminDashboard.types";

const metricConfig: Array<{
  label: string;
  key: keyof DashboardSummary;
  icon: LucideIcon;
}> = [
  { label: "Total Stores", key: "totalStores", icon: StoreIcon },
  { label: "Registered Users", key: "totalRegisteredUsers", icon: UsersIcon },
  { label: "Verified Users", key: "totalVerifiedUsers", icon: BadgeCheckIcon },
  { label: "Admin Accounts", key: "totalAdminAccounts", icon: UserCogIcon },
  { label: "Store Admins", key: "totalStoreAdmins", icon: Building2Icon },
  { label: "Super Admins", key: "totalSuperAdmins", icon: ShieldCheckIcon },
];

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <Card size="sm" className="rounded-lg">
      <CardContent className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {formatNumber(value)}
          </p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
          <Icon className="size-4" />
        </span>
      </CardContent>
    </Card>
  );
}

export function DashboardMetrics({
  summary,
}: {
  summary: DashboardSummary | null;
}) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {metricConfig.map(({ label, key, icon }) => (
        <MetricCard
          key={label}
          label={label}
          value={summary?.[key] ?? 0}
          icon={icon}
        />
      ))}
    </section>
  );
}
