import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import { productService } from "../services/product.service";
import type { StoreProduct } from "../types/product.types";

async function fetchProduct(storeId: string, slug: string): Promise<StoreProduct | null> {
  const res = await productService.getStoreProduct(storeId, slug);
  return res.data.data ?? null;
}

function handleError(error: unknown, setProduct: (value: StoreProduct | null) => void) {
  setProduct(null);
  if (error instanceof AxiosError && error.response?.status === 404) return;
  toast.error(getErrorMessage(error));
}

export function useStoreProduct(storeId: string, slug: string) {
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!storeId || !slug) return;
    let mounted = true;
    setIsLoading(true);
    fetchProduct(storeId, slug)
      .then((data) => mounted && setProduct(data))
      .catch((error) => mounted && handleError(error, setProduct))
      .finally(() => mounted && setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, [storeId, slug]);

  return { product, isLoading };
}
