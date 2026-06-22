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
import { discountService } from "../services/promo.service";
import type { Discount } from "../types/promo.types";

interface Props {
  open: boolean;
  discount: Discount | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (id: string) => void;
}

export function DeleteDiscountDialog({ open, discount, onOpenChange, onDeleted }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!discount) return;
    setIsDeleting(true);
    try {
      await discountService.remove(discount.id);
      toast.success("Discount deleted");
      onDeleted(discount.id);
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
          <DialogTitle>Delete discount</DialogTitle>
          <DialogDescription>
            Delete <strong>{discount?.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <Trash2Icon className="size-4" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
