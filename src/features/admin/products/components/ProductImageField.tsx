import { useEffect, useMemo, useRef } from "react";
import { useField, useFormikContext } from "formik";
import { ArrowDownIcon, ArrowUpIcon, ImagePlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PRODUCT_IMAGE_MAX_SIZE } from "../schemas/adminProduct.schemas";
import type { CreateProductFormValues } from "../types/adminProduct.types";

export function ProductImageField() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [{ value }, meta] = useField<File[]>("images");
  const { setFieldValue, setFieldTouched } = useFormikContext<CreateProductFormValues>();
  const error = meta.touched ? meta.error : undefined;
  const files = value ?? [];
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview)), [previews]);

  function handleFiles(nextFiles: FileList | null) {
    setFieldTouched("images", true);
    setFieldValue("images", Array.from(nextFiles ?? []).slice(0, 5));
  }

  function removeFile(fileIndex: number) {
    setFieldTouched("images", true);
    setFieldValue("images", files.filter((_, index) => index !== fileIndex));
    if (inputRef.current) inputRef.current.value = "";
  }

  function moveFile(fileIndex: number, direction: -1 | 1) {
    const targetIndex = fileIndex + direction;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const nextFiles = [...files];
    [nextFiles[fileIndex], nextFiles[targetIndex]] = [nextFiles[targetIndex], nextFiles[fileIndex]];
    setFieldTouched("images", true);
    setFieldValue("images", nextFiles);
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="images">Product Images</Label>
      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4">
        <input
          ref={inputRef}
          id="images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          multiple
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">JPG, PNG, or GIF. Up to 5 files, 1MB each.</div>
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            <ImagePlusIcon className="size-4" />
            Choose Images
          </Button>
        </div>
        {files.length ? (
          <SelectedFiles
            files={files}
            previews={previews}
            onMove={moveFile}
            onRemove={removeFile}
          />
        ) : null}
      </div>
      {typeof error === "string" ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SelectedFiles({
  files,
  previews,
  onMove,
  onRemove,
}: {
  files: File[];
  previews: string[];
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="mt-4 grid gap-3">
      {files.map((file, index) => (
        <SelectedFile
          key={`${file.name}-${file.lastModified}`}
          file={file}
          index={index}
          preview={previews[index]}
          total={files.length}
          onMove={onMove}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function SelectedFile({
  file,
  index,
  preview,
  total,
  onMove,
  onRemove,
}: {
  file: File;
  index: number;
  preview: string;
  total: number;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
}) {
  const isTooBig = file.size > PRODUCT_IMAGE_MAX_SIZE;

  return (
    <div className={cn("grid gap-3 rounded-md bg-background p-3 text-sm sm:grid-cols-[4rem_minmax(0,1fr)_auto]", isTooBig && "ring-1 ring-destructive")}>
      <img src={preview} alt={file.name} className="size-16 rounded-md object-cover object-top" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">{getImageLabel(index)}</span>
          <span className={cn("rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground", isTooBig && "bg-destructive/10 text-destructive")}>
            {formatFileSize(file.size)}
          </span>
        </div>
        <p className="mt-2 truncate font-medium">{file.name}</p>
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

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(size / 1024, 1).toFixed(0)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function getImageLabel(index: number) {
  return index === 0 ? "Header Image" : `Position ${index + 1}`;
}
