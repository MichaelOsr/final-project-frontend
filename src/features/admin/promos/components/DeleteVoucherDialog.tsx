import { useState } from "react";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { voucherService } from "../services/promo.service";
import type { Voucher } from "../types/voucher.types";

interface Props {
  open: boolean;
  voucher: Voucher | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

export function DeleteVoucherDialog({ open, voucher, onOpenChange, onDeleted }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!voucher) return;
    setIsDeleting(true);
    try {
      await voucherService.remove(voucher.id);
      toast.success("Voucher deleted");
      onDeleted(voucher.id);
      onOpenChange(false);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete voucher</DialogTitle>
          <DialogDescription>
            Delete voucher <strong>{voucher?.code}</strong>? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2Icon className="size-4 animate-spin" /> : <Trash2Icon className="size-4" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
