import { useEffect, useState } from "react";
import { productService } from "../services/product.service";
import type { Category } from "../types/product.types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let active = true;
    productService
      .getCategories()
      .then(({ data }) => {
        if (active) setCategories(data.data ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return categories;
}
