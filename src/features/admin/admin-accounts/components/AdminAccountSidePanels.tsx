import type { ReactNode } from "react";
import { ShieldCheckIcon, StoreIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminUserOverview } from "@/features/admin/shared/types/admin.types";
import { formatRoleName } from "@/features/admin/shared/utils/adminFormat";

export function CreateAccountGuide({
  rolesCount,
  storesCount,
}: {
  rolesCount: number;
  storesCount: number;
}) {
  return (
    <aside className="grid content-start gap-3">
      <GuideCard
        icon={<ShieldCheckIcon className="mb-3 size-5 text-primary" />}
        title="Access setup"
        text={`${rolesCount} roles available. Choose store admin only when store access is needed.`}
      />
      <GuideCard
        icon={<StoreIcon className="mb-3 size-5 text-primary" />}
        title="Store assignment"
        text={`${storesCount} stores loaded. Store is required for store admins.`}
      />
    </aside>
  );
}

export function EditAccountSummary({
  account,
  onDelete,
}: {
  account: AdminUserOverview | null;
  onDelete: () => void;
}) {
  return (
    <aside className="grid content-start gap-3">
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-semibold">{account?.name ?? "Admin account"}</p>
        <p className="mt-1 break-all text-sm text-muted-foreground">{account?.email ?? "Loading account..."}</p>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-semibold">Current assignment</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatRoleName(account?.role?.name)} · {account?.store?.name ?? "No store"}
        </p>
      </div>
      <Button type="button" variant="destructive" onClick={onDelete} disabled={!account}>
        <Trash2Icon className="size-4" />
        Delete Account
      </Button>
    </aside>
  );
}

function GuideCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      {icon}
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
