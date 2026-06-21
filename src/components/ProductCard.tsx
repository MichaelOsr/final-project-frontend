import { Link } from "react-router-dom";
import { Loader2Icon, ShoppingCartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface ProductCardProps {
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  to: string;
  outOfStock?: boolean;
  disabled?: boolean;
  isAdding?: boolean;
  inCartCount?: number;
  onAddToCart?: () => void;
}

export function ProductCard({
  name,
  category,
  price,
  imageUrl,
  to,
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
      </div>
      <div className="grid gap-1">
        <p className="text-xs text-muted-foreground">{category}</p>
        <h3 className="line-clamp-2 text-sm font-medium">{name}</h3>
        <p className="text-sm font-bold text-primary">{formatPrice(price)}</p>
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
