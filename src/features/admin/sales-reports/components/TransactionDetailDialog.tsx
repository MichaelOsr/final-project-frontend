import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminOrderService } from "@/features/admin/orders/services/adminOrder.service";
import type { AdminOrderDetail } from "@/features/admin/orders/types/adminOrder.types";
import {
  OrderInfoCard,
  OrderSummaryCard,
  PaymentProofCard,
} from "@/features/admin/orders/components/AdminOrderDetailCards";
import { AdminOrderItemsCard } from "@/features/admin/orders/components/AdminOrderItemsCard";
import { useReportError } from "@/features/admin/shared/hooks/useReportError";
import { useLatestRequest } from "@/features/admin/shared/hooks/useLatestRequest";

interface TransactionDetailDialogProps {
  transactionId: string | null;
  onClose: () => void;
}

// Read-only drilldown for a transaction row. Reuses the admin order detail
// endpoint and cards; the sales report transactionId is the order PK.
export function TransactionDetailDialog({ transactionId, onClose }: TransactionDetailDialogProps) {
  const handleError = useReportError();
  const { start, isCurrent } = useLatestRequest();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!transactionId) return;
    const id = transactionId;
    const requestId = start();
    async function load() {
      setIsLoading(true);
      setOrder(null);
      setHasError(false);
      try {
        const res = await adminOrderService.getById(id);
        if (isCurrent(requestId)) setOrder(res.data.data);
      } catch (error) {
        if (!isCurrent(requestId)) return;
        handleError(error);
        setHasError(true);
      } finally {
        if (isCurrent(requestId)) setIsLoading(false);
      }
    }
    load();
  }, [transactionId, handleError, start, isCurrent]);

  return (
    <Dialog open={Boolean(transactionId)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction Detail</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {transactionId}
          </DialogDescription>
        </DialogHeader>
        <DialogBody isLoading={isLoading} hasError={hasError} order={order} />
      </DialogContent>
    </Dialog>
  );
}

function DialogBody({
  isLoading,
  hasError,
  order,
}: {
  isLoading: boolean;
  hasError: boolean;
  order: AdminOrderDetail | null;
}) {
  if (isLoading) return <BodyMessage message="Loading transaction..." />;
  if (hasError) {
    return (
      <BodyMessage message="Couldn't load this transaction. It may not exist, or you may not have access to it." />
    );
  }
  if (!order) return <BodyMessage message="Transaction details are not available." />;
  return (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
      <OrderInfoCard order={order} />
      <AdminOrderItemsCard items={order.items} />
      <OrderSummaryCard order={order} />
      {order.paymentProof && <PaymentProofCard proofUrl={order.paymentProof} />}
    </div>
  );
}

function BodyMessage({ message }: { message: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{message}</p>;
}
