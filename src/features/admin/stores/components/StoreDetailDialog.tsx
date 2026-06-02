import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/features/admin/dashboard/utils/dashboardFormat";
import type { AdminStore } from "../types/adminStore.types";

interface StoreDetailDialogProps {
  isLoading: boolean;
  open: boolean;
  store: AdminStore | null;
  onOpenChange: (open: boolean) => void;
}

export function StoreDetailDialog({ isLoading, open, store, onOpenChange }: StoreDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Store details</DialogTitle>
          <DialogDescription>Location and audit information for this store.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="py-6 text-sm text-muted-foreground">Loading store...</p>
        ) : store ? (
          <div className="grid gap-3">
            <DetailRow label="Name" value={store.name} />
            <DetailRow label="Latitude" value={store.latitude ?? "-"} />
            <DetailRow label="Longitude" value={store.longitude ?? "-"} />
            <DetailRow label="Created" value={formatDate(store.createdAt)} />
            <DetailRow label="Updated" value={formatDate(store.updatedAt)} />
          </div>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">Store was not found.</p>
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
