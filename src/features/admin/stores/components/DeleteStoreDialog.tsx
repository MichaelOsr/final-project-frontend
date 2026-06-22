import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteStoreDialogProps {
  storeName: string;
  isDeleting: boolean;
  open: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function DeleteStoreDialog(props: DeleteStoreDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete store?</DialogTitle>
          <DialogDescription>
            This will permanently delete{" "}
            <span className="font-medium">
              {props.storeName || "this store"}
            </span>
            . Admin accounts assigned to this store will lose their store
            assignment.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => props.onOpenChange(false)}
            disabled={props.isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={props.onConfirm}
            disabled={props.isDeleting}
          >
            {props.isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
