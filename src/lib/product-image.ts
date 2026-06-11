const PLACEHOLDER_IMAGE = "/placeholder-product.png";

interface ImageWithPosition {
  image: string | null;
  position: number;
}

export function getMainImage(images: ImageWithPosition[]): string {
  if (!images.length) return PLACEHOLDER_IMAGE;
  const sorted = [...images].sort((a, b) => a.position - b.position);
  return sorted[0].image ?? PLACEHOLDER_IMAGE;
}
