import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ClearStockDialogProps {
  productName: string;
  currentStock: number;
  isClearing: boolean;
  open: boolean;
  onConfirm: (notes: string) => void;
  onOpenChange: (open: boolean) => void;
}

export function ClearStockDialog(props: ClearStockDialogProps) {
  const [notes, setNotes] = useState("");

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) setNotes("");
        props.onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear stock?</DialogTitle>
          <DialogDescription>
            This will set the stock for {props.productName || "this product"} (currently {props.currentStock}) to 0 and record an
            adjustment in the stock history. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="clear-stock-notes">Notes (optional)</Label>
          <Textarea
            id="clear-stock-notes"
            placeholder="e.g. Stock opname adjustment"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)} disabled={props.isClearing}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => props.onConfirm(notes)} disabled={props.isClearing || props.currentStock === 0}>
            {props.isClearing ? <Spinner /> : null}
            Clear Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
