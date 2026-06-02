import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteStoreDialogProps {
  isDeleting: boolean;
  open: boolean;
  storeName: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function DeleteStoreDialog({ isDeleting, open, storeName, onConfirm, onOpenChange }: DeleteStoreDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete store?</DialogTitle>
          <DialogDescription>
            This will remove {storeName || "this store"} from active store lists.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
