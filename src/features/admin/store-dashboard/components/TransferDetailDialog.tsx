import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate, getInitials } from "@/features/admin/shared/utils/adminFormat";
import type { StockTransferRequest, TransferAction } from "../types/stockTransfer.types";
import {
  TRANSFER_ACTION_LABELS,
  getTransferActions,
  getTransferStatusBadgeClass,
  getTransferStatusLabel,
} from "../utils/stockTransfer";

interface Props {
  open: boolean;
  request: StockTransferRequest | null;
  isLoading: boolean;
  myStoreId: string;
  onOpenChange: (open: boolean) => void;
  onAction: (request: StockTransferRequest, action: TransferAction) => void;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 rounded-lg bg-muted/50 p-3 sm:grid-cols-[9rem_1fr]">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function ActorRow({ label, actor, date }: { label: string; actor: { name: string; email: string } | null; date: string | null }) {
  if (!actor) return null;
  return (
    <DetailRow label={label}>
      <div className="flex items-center gap-2">
        <Avatar size="sm"><AvatarFallback>{getInitials(actor.name)}</AvatarFallback></Avatar>
        <div>
          <p>{actor.name}</p>
          <p className="text-xs text-muted-foreground">{actor.email}</p>
          {date && <p className="text-xs text-muted-foreground">{formatDate(date)}</p>}
        </div>
      </div>
    </DetailRow>
  );
}

export function TransferDetailDialog({ open, request, isLoading, myStoreId, onOpenChange, onAction }: Props) {
  const actions = request ? getTransferActions(request, myStoreId) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Transfer Request Details</DialogTitle>
          <DialogDescription>Full record of this stock transfer request.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="py-6 text-sm text-muted-foreground">Loading details...</p>
        ) : request ? (
          <div className="grid gap-3 overflow-y-auto max-h-[65vh]">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Quantity</p>
                <p className="text-lg font-semibold">{request.quantity}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getTransferStatusBadgeClass(request.status)}`}>
                  {getTransferStatusLabel(request.status)}
                </span>
              </div>
            </div>

            <DetailRow label="Product">
              <Link to={`/admin/store/products/${request.product.slug}`} className="font-medium text-primary hover:underline">
                {request.productName}
              </Link>
              <p className="font-mono text-xs text-muted-foreground">{request.product.sku}</p>
              {request.product.name !== request.productName && (
                <p className="text-xs text-muted-foreground">Currently listed as &ldquo;{request.product.name}&rdquo;</p>
              )}
            </DetailRow>
            <DetailRow label="From store">{request.fromStore.name}</DetailRow>
            <DetailRow label="To store">{request.toStore.name}</DetailRow>

            <ActorRow label="Requested by" actor={request.requestedBy} date={request.requestedAt ?? request.createdAt} />
            <ActorRow label="Approved by" actor={request.approvedBy} date={request.approvedAt} />
            <ActorRow label="Rejected by" actor={request.rejectedBy} date={request.rejectedAt} />
            <ActorRow label="Received by" actor={request.receivedBy} date={request.receivedAt} />
            <ActorRow label="Cancelled by" actor={request.cancelledBy} date={request.cancelledAt} />

            {request.requestNotes && <DetailRow label="Request notes">{request.requestNotes}</DetailRow>}
            {request.responseNotes && <DetailRow label="Response notes">{request.responseNotes}</DetailRow>}
            {request.receivedNotes && <DetailRow label="Received notes">{request.receivedNotes}</DetailRow>}
            {request.cancelledNotes && <DetailRow label="Cancelled notes">{request.cancelledNotes}</DetailRow>}
            {request.notes && <DetailRow label="Notes">{request.notes}</DetailRow>}

            {actions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {actions.map((action) => (
                  <Button
                    key={action}
                    variant={action === "reject" || action === "cancel" ? "destructive" : "default"}
                    size="sm"
                    onClick={() => { onAction(request, action); onOpenChange(false); }}
                  >
                    {TRANSFER_ACTION_LABELS[action]}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">Transfer request not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
