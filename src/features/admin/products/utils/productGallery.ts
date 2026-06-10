import { PRODUCT_IMAGE_MAX_SIZE, PRODUCT_IMAGE_TYPES } from "../schemas/adminProduct.schemas";
import type { AdminProduct, ProductGalleryItem } from "../types/adminProduct.types";

export function toGalleryItems(product: AdminProduct | null): ProductGalleryItem[] {
  return [...(product?.images ?? [])]
    .sort((first, second) => first.position - second.position)
    .map((image) => ({
      type: "existing",
      id: image.id,
      image: image.image,
      name: `Image ${image.position}`,
    }));
}

export function validateGallery(items: ProductGalleryItem[]) {
  if (items.length < 1) return "Keep at least one product image";
  if (items.length > 5) return "Keep up to 5 product images";
  const newFiles = items.filter((item) => item.type === "new").map((item) => item.file);
  if (newFiles.some((file) => !PRODUCT_IMAGE_TYPES.includes(file.type))) return "New images must be JPG, PNG, or GIF";
  if (newFiles.some((file) => file.size > PRODUCT_IMAGE_MAX_SIZE)) return "Each new image must be 1MB or smaller";
  return "";
}

export function toImagesPayload(items: ProductGalleryItem[]) {
  return {
    existingImages: items.flatMap((item, index) => (
      item.type === "existing" ? [{ id: item.id, position: index + 1 }] : []
    )),
    newImages: items.flatMap((item) => (item.type === "new" ? [item.file] : [])),
    newImagePositions: items.flatMap((item, index) => (item.type === "new" ? [index + 1] : [])),
  };
}
