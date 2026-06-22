import { Link } from "react-router-dom";
import { Loader2Icon, ShoppingCartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { PricePreview } from "@/types/product.types";

interface ProductCardProps {
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  to: string;
  pricePreview?: PricePreview | null;
  outOfStock?: boolean;
  disabled?: boolean;
  isAdding?: boolean;
  inCartCount?: number;
  onAddToCart?: () => void;
}

function DiscountBadge({ label }: { label: string }) {
  return (
    <span className="absolute left-0 top-0 rounded-br-lg bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
      {label}
    </span>
  );
}

function PriceSection({ price, pricePreview }: { price: number; pricePreview?: PricePreview | null }) {
  if (!pricePreview?.isDiscounted) {
    return <p className="text-sm font-bold text-primary">{formatPrice(price)}</p>;
  }
  if (pricePreview.calculationMode === "unitPrice" && pricePreview.finalPrice !== null) {
    return (
      <div className="grid gap-0.5">
        <p className="text-xs text-muted-foreground line-through">{formatPrice(pricePreview.originalPrice)}</p>
        <p className="text-sm font-bold text-primary">{formatPrice(pricePreview.finalPrice)}</p>
      </div>
    );
  }
  return <p className="text-sm font-bold text-primary">{formatPrice(price)}</p>;
}

export function ProductCard({
  name,
  category,
  price,
  imageUrl,
  to,
  pricePreview,
  outOfStock = false,
  disabled = false,
  isAdding = false,
  inCartCount = 0,
  onAddToCart,
}: ProductCardProps) {
  const content = (
    <>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          className="size-full object-cover transition-transform group-hover:scale-105"
        />
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
            <span className="rounded bg-background px-2 py-1 text-xs font-semibold text-foreground">
              Out of stock
            </span>
          </div>
        )}
        {!outOfStock && pricePreview?.isDiscounted && pricePreview.label && (
          <DiscountBadge label={pricePreview.label} />
        )}
      </div>
      <div className="grid gap-1">
        <p className="text-xs text-muted-foreground">{category}</p>
        <h3 className="line-clamp-2 text-sm font-medium">{name}</h3>
        <PriceSection price={price} pricePreview={pricePreview} />
      </div>
    </>
  );

  return (
    <div className="group grid content-between gap-3 rounded-xl border bg-white p-3 transition-shadow hover:shadow-md">
      {to ? (
        <Link to={to} className="grid gap-3">
          {content}
        </Link>
      ) : (
        <div className="grid gap-3">{content}</div>
      )}

      <div className="grid gap-1.5">
        {inCartCount > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            {inCartCount} in cart
          </p>
        )}
        <Button
          className="w-full rounded-full"
          size="sm"
          disabled={outOfStock || disabled || isAdding}
          onClick={onAddToCart}
        >
          {isAdding ? <Loader2Icon className="animate-spin" /> : <ShoppingCartIcon />}
          Add to cart
        </Button>
      </div>
    </div>
  );
}
