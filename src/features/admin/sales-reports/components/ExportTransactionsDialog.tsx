import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExportTransactionsDialogProps {
  open: boolean;
  isExporting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ExportTransactionsDialog({
  open,
  isExporting,
  onOpenChange,
  onConfirm,
}: ExportTransactionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={isExporting ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export transactions to CSV?</DialogTitle>
          <DialogDescription>
            This downloads every confirmed transaction matching the current date range and
            search filter, with no page limit. Large ranges may take a moment to prepare.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isExporting}>
            {isExporting ? "Preparing..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
