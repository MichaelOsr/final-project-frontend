import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProductImagePreviewDialogProps {
  alt: string;
  image: string;
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
}

export function ProductImagePreviewDialog({
  alt,
  image,
  open,
  title,
  onOpenChange,
}: ProductImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-hidden p-3 sm:max-w-4xl">
        <DialogHeader className="pr-10">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[calc(100svh-7rem)] items-center justify-center overflow-auto rounded-lg bg-muted/40">
          <img src={image} alt={alt} className="max-h-[calc(100svh-7rem)] w-auto max-w-full object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
