import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2Icon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { cartService } from "@/features/cart/services/cart.service";

interface AddToCartControlProps {
  productId: string;
  storeId: string;
  stock: number;
  isAvailable: boolean;
}

export function AddToCartControl({
  productId,
  storeId,
  stock,
  isAvailable,
}: AddToCartControlProps) {
  const navigate = useNavigate();
  const status = useAuthStore((s) => s.status);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const inCart = useCartStore(
    (s) => s.cart?.items.find((i) => i.productId === productId)?.quantity ?? 0
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const remaining = Math.max(stock - inCart, 0);
  const maxQty = Math.max(remaining, 1);
  const outOfStock = !isAvailable || stock < 1;
  const disabled = outOfStock || remaining < 1;

  function changeQty(next: number) {
    setQuantity(Math.min(Math.max(next, 1), maxQty));
  }

  async function handleAdd() {
    if (status === "unauthenticated") return navigate("/login");
    setIsAdding(true);
    try {
      await cartService.addToCart({ productId, storeId, quantity });
      await fetchCart();
      toast.success("Item added to cart");
      setQuantity(1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 py-6 sm:py-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => changeQty(quantity - 1)}
          disabled={disabled || quantity <= 1}
          aria-label="Decrease quantity"
        >
          <MinusIcon className="size-4" />
        </Button>
        <span className="w-8 text-center text-base font-semibold tabular-nums">
          {quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => changeQty(quantity + 1)}
          disabled={disabled || quantity >= maxQty}
          aria-label="Increase quantity"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>
      <Button
        className="h-12 flex-1 gap-2 rounded-full p-1.5 font-semibold"
        onClick={handleAdd}
        disabled={disabled || isAdding}
      >
        {isAdding ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <ShoppingCartIcon className="size-4" />
        )}
        {outOfStock ? "Out of stock" : remaining < 1 ? "Max in cart" : "Add to cart"}
      </Button>
      </div>
      {inCart > 0 && (
        <p className="text-xs text-muted-foreground">
          {inCart} already in your cart
        </p>
      )}
    </div>
  );
}
