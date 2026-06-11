import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { cartService } from "../services/cart.service";
import type { AddToCartPayload } from "@/types/cart.types";

// Shared add-to-cart flow: redirects guests to login, otherwise posts the
// item, refreshes the cart store, and reports success/failure via toast.
export function useAddToCart() {
  const navigate = useNavigate();
  const status = useAuthStore((s) => s.status);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [isAdding, setIsAdding] = useState(false);

  async function addToCart(payload: AddToCartPayload) {
    if (status === "unauthenticated") return navigate("/login");

    setIsAdding(true);
    try {
      await cartService.addToCart(payload);
      await fetchCart();
      toast.success("Item added to cart");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsAdding(false);
    }
  }

  return { addToCart, isAdding };
}
