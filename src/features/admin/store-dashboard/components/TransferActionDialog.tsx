import { useFormik } from "formik";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { transferActionSchema } from "../schemas/stockTransfer.schemas";
import { stockTransferService } from "../services/stockTransfer.service";
import type { StockTransferRequest, TransferAction } from "../types/stockTransfer.types";
import { TRANSFER_ACTION_LABELS, TRANSFER_ACTION_NOTES_LABEL } from "../utils/stockTransfer";

interface Props {
  open: boolean;
  request: StockTransferRequest | null;
  action: TransferAction | null;
  onOpenChange: (open: boolean) => void;
  onDone: (updated: StockTransferRequest) => void;
}

export function TransferActionDialog({ open, request, action, onOpenChange, onDone }: Props) {
  const formik = useFormik({
    initialValues: { notes: "" },
    validationSchema: transferActionSchema,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      if (!request || !action) return;
      try {
        const PAST: Record<TransferAction, string> = { approve: "approved", reject: "rejected", receive: "received", cancel: "cancelled" };
        let updated: StockTransferRequest;
        const notes = values.notes.trim() || undefined;
        if (action === "approve") {
          const res = await stockTransferService.approve(request.id, { responseNotes: notes });
          updated = res.data.data!.request;
        } else if (action === "reject") {
          const res = await stockTransferService.reject(request.id, { responseNotes: notes });
          updated = res.data.data!;
        } else if (action === "receive") {
          const res = await stockTransferService.receive(request.id, { receivedNotes: notes });
          updated = res.data.data!.request;
        } else {
          const res = await stockTransferService.cancel(request.id, { cancelledNotes: notes });
          updated = res.data.data!;
        }
        toast.success(`Transfer request ${PAST[action]}`);
        onDone(updated);
        onOpenChange(false);
      } catch (error) {
        toast.error(getAdminErrorMessage(error));
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  function handleClose() {
    formik.resetForm();
    onOpenChange(false);
  }

  const actionLabel = action ? TRANSFER_ACTION_LABELS[action] : "";
  const notesLabel = action ? TRANSFER_ACTION_NOTES_LABEL[action] : "Notes (optional)";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{actionLabel} Transfer Request</DialogTitle>
          <DialogDescription>
            {request && (
              <>
                <span className="font-medium">{request.productName}</span> — Qty {request.quantity}
                <br />
                {request.fromStore.name} &rarr; {request.toStore.name}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="notes">{notesLabel}</Label>
            <Textarea
              id="notes"
              placeholder="Add a note..."
              rows={3}
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.notes && formik.errors.notes && (
              <p className="text-xs text-destructive">{formik.errors.notes}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              variant={action === "reject" || action === "cancel" ? "destructive" : "default"}
            >
              {formik.isSubmitting && <Spinner />}
              {actionLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
