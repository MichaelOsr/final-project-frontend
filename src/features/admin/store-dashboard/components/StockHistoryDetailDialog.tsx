import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/features/admin/shared/utils/adminFormat";
import { getMovementBadgeClass, getMovementDirection, getMovementLabel } from "../utils/stockMovement";
import type { StockMovement } from "../types/stockMovement.types";

interface StockHistoryDetailDialogProps {
  isLoading: boolean;
  open: boolean;
  movement: StockMovement | null;
  onOpenChange: (open: boolean) => void;
}

export function StockHistoryDetailDialog({ isLoading, open, movement, onOpenChange }: StockHistoryDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Stock movement details</DialogTitle>
          <DialogDescription>Full record of this stock history entry.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="py-6 text-sm text-muted-foreground">Loading details...</p>
        ) : movement ? (
          <div className="grid gap-3">
            <MovementSummary movement={movement} />
            <DetailRow label="Product">
              <Link to={`/admin/store/products/${movement.product.slug}`} className="font-medium text-primary hover:underline">
                {movement.name}
              </Link>
              <p className="font-mono text-xs text-muted-foreground">{movement.product.sku}</p>
              {movement.product.name !== movement.name && (
                <p className="text-xs text-muted-foreground">Currently listed as &ldquo;{movement.product.name}&rdquo;</p>
              )}
            </DetailRow>
            <DetailRow label="Store">{movement.store.name}</DetailRow>
            <DetailRow label="Admin">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarFallback>{getInitials(movement.admin?.name ?? "System")}</AvatarFallback>
                </Avatar>
                <div>
                  <p>{movement.admin?.name ?? "System"}</p>
                  {movement.admin && <p className="text-xs text-muted-foreground">{movement.admin.email}</p>}
                </div>
              </div>
            </DetailRow>
            <DetailRow label="Notes">{movement.notes || "-"}</DetailRow>
            <DetailRow label="Transaction ID">{movement.transactionId ?? "-"}</DetailRow>
            <DetailRow label="Created">{formatDate(movement.createdAt)}</DetailRow>
            <DetailRow label="Updated">{formatDate(movement.updatedAt)}</DetailRow>
          </div>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">Stock movement was not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MovementSummary({ movement }: { movement: StockMovement }) {
  const isIncrease = getMovementDirection(movement.type) === "in";
  return (
    <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Type</p>
        <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getMovementBadgeClass(movement.type)}`}>
          {getMovementLabel(movement.type)}
        </span>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">Quantity</p>
        {movement.quantity === null ? (
          <p className="text-lg font-semibold text-muted-foreground">-</p>
        ) : (
          <p className={`text-lg font-semibold ${isIncrease ? "text-green-700" : "text-red-700"}`}>
            {isIncrease ? "+" : "-"}{movement.quantity}
          </p>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">Stock</p>
        <p className="text-sm">{movement.stockBefore ?? "-"} &rarr; {movement.stockAfter ?? "-"}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 rounded-lg bg-muted/50 p-3 sm:grid-cols-[8rem_1fr]">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  );
}
