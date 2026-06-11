import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "../services/product.service";
import { getErrorMessage } from "@/lib/error";
import { getPageParam } from "../utils/searchParams";
import type { PaginationMeta } from "@/types/api.types";
import type { CatalogProductsParams, StoreProduct } from "../types/product.types";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export function useCatalogProducts(storeId: string | null) {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = buildParams(searchParams);
  const key = JSON.stringify(params);

  useEffect(() => {
    if (!storeId) return;

    let active = true;
    setIsLoading(true);
    setError(null);

    productService
      .getStoreProducts(storeId, params)
      .then(({ data }) => {
        if (!active) return;
        setProducts(data.data);
        setMeta(data.meta);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, "Failed to load products"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, key]);

  return { products, meta, isLoading, error };
}

function buildParams(searchParams: URLSearchParams): CatalogProductsParams {
  const minPrice = toNonNegativeInt(searchParams.get("minPrice"));
  const maxPrice = toNonNegativeInt(searchParams.get("maxPrice"));

  return {
    q: searchParams.get("q") || undefined,
    categoryId: searchParams.get("categoryId") || undefined,
    inStock: searchParams.get("inStock") === "true" ? true : undefined,
    minPrice,
    maxPrice: minPrice !== undefined && maxPrice !== undefined && maxPrice < minPrice ? undefined : maxPrice,
    sortBy: (searchParams.get("sortBy") as CatalogProductsParams["sortBy"]) || "price",
    sortOrder: (searchParams.get("sortOrder") as CatalogProductsParams["sortOrder"]) || "asc",
    page: getPageParam(searchParams),
    limit: getLimitParam(searchParams),
  };
}

function getLimitParam(searchParams: URLSearchParams): number {
  const parsed = Number(searchParams.get("limit"));
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function toNonNegativeInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}
