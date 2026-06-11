import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { ProductImage } from "../types/product.types";

interface ProductGalleryProps {
  images: ProductImage[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [active, setActive] = useState(0);

  if (!sorted.length) {
    return (
      <div className="aspect-square rounded-xl border border-border bg-muted/30" />
    );
  }

  const main = sorted[active] ?? sorted[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 p-6">
        <img
          src={main.image}
          alt={name}
          className="h-full w-full object-contain"
        />
      </div>
      {sorted.length > 1 && (
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {sorted.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActive(index)}
                className={`shrink-0 rounded-lg border-2 p-2 transition-colors ${
                  index === active
                    ? "border-primary"
                    : "border-border hover:border-primary/50"
                }`}
                style={{ width: "80px", height: "80px" }}
              >
                <img
                  src={image.image}
                  alt={`${name} ${index + 1}`}
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
