import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface OrderActionDialogProps {
  title: string
  description: string
  actionLabel: string
  variant?: "default" | "destructive"
  isLoading: boolean
  open: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function OrderActionDialog({
  title,
  description,
  actionLabel,
  variant = "default",
  isLoading,
  open,
  onConfirm,
  onOpenChange,
}: OrderActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}