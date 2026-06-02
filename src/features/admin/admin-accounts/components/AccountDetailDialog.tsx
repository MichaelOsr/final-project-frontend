import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AdminUserOverview } from "@/features/admin/shared/types/admin.types";
import { formatDate, formatRoleName, getInitials } from "@/features/admin/shared/utils/adminFormat";

interface AccountDetailDialogProps {
  isLoading: boolean;
  open: boolean;
  account: AdminUserOverview | null;
  onOpenChange: (open: boolean) => void;
}

export function AccountDetailDialog({ account, isLoading, open, onOpenChange }: AccountDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Account details</DialogTitle>
          <DialogDescription>Profile information visible to admin users.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="py-6 text-sm text-muted-foreground">Loading account...</p>
        ) : account ? (
          <div className="grid gap-3">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Avatar className="size-12">
                <AvatarImage src={account.avatar ?? undefined} alt={account.name} />
                <AvatarFallback>{getInitials(account.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{account.name}</p>
                <p className="truncate text-sm text-muted-foreground">{account.email}</p>
              </div>
            </div>
            <DetailRow label="Role" value={formatRoleName(account.role?.name)} />
            <DetailRow label="Store" value={account.store?.name ?? "-"} />
            <DetailRow label="Verified" value={account.isVerified ? "Verified" : "Pending"} />
            <DetailRow label="Created" value={formatDate(account.createdAt)} />
          </div>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">Account was not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-lg bg-muted/50 p-3 sm:grid-cols-[8rem_1fr]">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
