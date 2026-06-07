import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, ImagePlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PRODUCT_IMAGE_MAX_SIZE } from "../schemas/adminProduct.schemas";
import type { ProductGalleryItem } from "../types/adminProduct.types";
import { ProductImagePreviewDialog } from "./ProductImagePreviewDialog";

interface ProductGalleryEditorProps {
  items: ProductGalleryItem[];
  onChange: (items: ProductGalleryItem[]) => void;
}

export function ProductGalleryEditor({ items, onChange }: ProductGalleryEditorProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<{ image: string; title: string } | null>(null);
  const previews = useMemo(() => createPreviews(items), [items]);

  useEffect(() => () => revokeNewPreviews(items, previews), [items, previews]);

  function addFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    const nextItems = files.map((file, index) => ({
      type: "new" as const,
      id: `${file.name}-${file.lastModified}-${index}-${Date.now()}`,
      file,
    }));
    onChange([...items, ...nextItems].slice(0, 5));
    if (inputRef.current) inputRef.current.value = "";
  }

  function moveItem(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const nextItems = [...items];
    [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];
    onChange(nextItems);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="galleryImages">Product Images</Label>
      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4">
        <input
          ref={inputRef}
          id="galleryImages"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          multiple
          className="sr-only"
          onChange={(event) => addFiles(event.target.files)}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">Keep 1 to 5 images. Use arrows to set final positions.</div>
          <Button type="button" variant="outline" disabled={items.length >= 5} onClick={() => inputRef.current?.click()}>
            <ImagePlusIcon className="size-4" />
            Add Images
          </Button>
        </div>
        <div className="mt-4 grid gap-3">
          {items.map((item, index) => (
            <GalleryItemRow
              key={item.id}
              index={index}
              item={item}
              preview={previews[index]}
              total={items.length}
              onMove={moveItem}
              onPreview={() => setPreview({ image: previews[index], title: getItemName(item) })}
              onRemove={removeItem}
            />
          ))}
        </div>
      </div>
      <ProductImagePreviewDialog
        alt={preview?.title ?? "Product image"}
        image={preview?.image ?? ""}
        open={Boolean(preview)}
        title={preview?.title ?? "Product image"}
        onOpenChange={(open) => !open && setPreview(null)}
      />
    </div>
  );
}

function GalleryItemRow({
  index,
  item,
  preview,
  total,
  onMove,
  onPreview,
  onRemove,
}: {
  index: number;
  item: ProductGalleryItem;
  preview: string;
  total: number;
  onMove: (index: number, direction: -1 | 1) => void;
  onPreview: () => void;
  onRemove: (index: number) => void;
}) {
  const fileSize = item.type === "new" ? item.file.size : null;
  const isTooBig = fileSize !== null && fileSize > PRODUCT_IMAGE_MAX_SIZE;

  return (
    <div className={cn("grid gap-3 rounded-md bg-background p-3 text-sm sm:grid-cols-[4rem_minmax(0,1fr)_auto]", isTooBig && "ring-1 ring-destructive")}>
      <button type="button" className="size-16 overflow-hidden rounded-md" onClick={onPreview}>
        <img src={preview} alt={getItemName(item)} className="size-full object-cover object-top transition hover:scale-105" />
      </button>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">{getImageLabel(index)}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{item.type === "existing" ? "Existing" : "New"}</span>
          {fileSize !== null ? <SizeBadge size={fileSize} isTooBig={isTooBig} /> : null}
        </div>
        <p className="mt-2 truncate font-medium">{getItemName(item)}</p>
        {isTooBig ? <p className="mt-1 text-xs text-destructive">This image is larger than 1MB.</p> : null}
      </div>
      <div className="flex items-center justify-end gap-1">
        <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => onMove(index, -1)} aria-label="Move image up">
          <ArrowUpIcon className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" disabled={index === total - 1} onClick={() => onMove(index, 1)} aria-label="Move image down">
          <ArrowDownIcon className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onRemove(index)} aria-label="Remove image">
          <XIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function SizeBadge({ size, isTooBig }: { size: number; isTooBig: boolean }) {
  return (
    <span className={cn("rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground", isTooBig && "bg-destructive/10 text-destructive")}>
      {formatFileSize(size)}
    </span>
  );
}

function createPreviews(items: ProductGalleryItem[]) {
  return items.map((item) => (item.type === "existing" ? item.image : URL.createObjectURL(item.file)));
}

function revokeNewPreviews(items: ProductGalleryItem[], previews: string[]) {
  previews.forEach((preview, index) => {
    if (items[index]?.type === "new") URL.revokeObjectURL(preview);
  });
}

function getItemName(item: ProductGalleryItem) {
  return item.type === "existing" ? item.name : item.file.name;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(size / 1024, 1).toFixed(0)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function getImageLabel(index: number) {
  return index === 0 ? "Header Image" : `Position ${index + 1}`;
}
