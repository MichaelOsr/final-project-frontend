import { format, parseISO } from "date-fns";
import { ListFilterIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/features/admin/shared/utils/adminFormat";
import {
  getMovementBadgeClass,
  getMovementDirection,
  getMovementLabel,
} from "@/features/admin/store-dashboard/utils/stockMovement";
import type { StockReportItem } from "../types/stockReport.types";

interface StockReportDetailDialogProps {
  open: boolean;
  item: StockReportItem | null;
  onOpenChange: (open: boolean) => void;
  // Lets the admin drill into every movement for this product (sets the
  // productId filter and closes the dialog).
  onFilterProduct?: (productId: string) => void;
}

function formatTimestamp(value: string) {
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "dd MMM yyyy HH:mm");
}

// Detail view for a stock movement. Built entirely from the report row (no extra
// fetch); the report endpoint already returns every field shown here.
export function StockReportDetailDialog({
  open,
  item,
  onOpenChange,
  onFilterProduct,
}: StockReportDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Stock movement details</DialogTitle>
          <DialogDescription>Full record of this stock history entry.</DialogDescription>
        </DialogHeader>
        {item ? (
          <div className="grid gap-3">
            <MovementSummary item={item} />
            <DetailRow label="Product">
              <p className="font-medium">{item.productName}</p>
              <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
            </DetailRow>
            <DetailRow label="Category">{item.categoryName || "—"}</DetailRow>
            <DetailRow label="Store">{item.storeName}</DetailRow>
            <DetailRow label="Admin">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarFallback>{getInitials(item.admin?.name ?? "System")}</AvatarFallback>
                </Avatar>
                <div>
                  <p>{item.admin?.name ?? "System"}</p>
                  {item.admin && (
                    <p className="text-xs text-muted-foreground">{item.admin.email}</p>
                  )}
                </div>
              </div>
            </DetailRow>
            <DetailRow label="Notes">{item.notes || "—"}</DetailRow>
            <DetailRow label="Transaction ID">{item.transactionId ?? "—"}</DetailRow>
            <DetailRow label="Transfer Request ID">{item.stockTransferRequestId ?? "—"}</DetailRow>
            <DetailRow label="Created">{formatTimestamp(item.createdAt)}</DetailRow>
          </div>
        ) : null}
        {item && onFilterProduct && (
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFilterProduct(item.productId)}
            >
              <ListFilterIcon className="size-3.5" />
              View all movements for this product
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MovementSummary({ item }: { item: StockReportItem }) {
  const isIncrease = getMovementDirection(item.type) === "in";
  return (
    <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Type</p>
        <span
          className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getMovementBadgeClass(
            item.type,
          )}`}
        >
          {getMovementLabel(item.type)}
        </span>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">Quantity</p>
        {item.quantity === null ? (
          <p className="text-lg font-semibold text-muted-foreground">—</p>
        ) : (
          <p className={`text-lg font-semibold ${isIncrease ? "text-green-700" : "text-red-700"}`}>
            {isIncrease ? "+" : "-"}
            {item.quantity}
          </p>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">Stock</p>
        <p className="text-sm">
          {item.stockBefore ?? "—"} &rarr; {item.stockAfter ?? "—"}
        </p>
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
