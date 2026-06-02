import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AdminUserOverview } from "@/features/admin/dashboard/types/adminDashboard.types";
import { formatDate, getInitials } from "@/features/admin/dashboard/utils/dashboardFormat";
import { formatRoleName } from "@/features/admin/admin-accounts/utils/adminAccountFormat";

interface AdminUserDetailDialogProps {
  isLoading: boolean;
  open: boolean;
  user: AdminUserOverview | null;
  onOpenChange: (open: boolean) => void;
}

export function AdminUserDetailDialog({ isLoading, open, user, onOpenChange }: AdminUserDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>User details</DialogTitle>
          <DialogDescription>Profile information visible to admin users.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="py-6 text-sm text-muted-foreground">Loading user...</p>
        ) : user ? (
          <div className="grid gap-3">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Avatar className="size-12">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <DetailRow label="Role" value={formatRoleName(user.role?.name)} />
            <DetailRow label="Store" value={user.store?.name ?? "-"} />
            <DetailRow label="Verified" value={user.isVerified ? "Verified" : "Pending"} />
            <DetailRow label="Created" value={formatDate(user.createdAt)} />
          </div>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">User was not found.</p>
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
