import type { ActiveDiscount, PricePreview } from "@/types/product.types";
export type { ActiveDiscount, PricePreview };

export interface ProductImage {
  id: string;
  image: string;
  position: number;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface StoreStock {
  productStockId: string | null;
  storeId: string;
  stock: number;
  isAvailable: boolean;
  store: {
    id: string;
    name: string;
    latitude: string | null;
    longitude: string | null;
  };
  createdAt: string | null;
  updatedAt: string | null;
}

export interface StoreProduct {
  id: string;
  weight: number;
  name: string;
  slug: string;
  categoryId: string;
  brand: string | null;
  variant: string | null;
  size: string | null;
  description: string | null;
  sku: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category: ProductCategory;
  images: ProductImage[];
  storeStock: StoreStock;
  activeDiscount?: ActiveDiscount | null;
  pricePreview?: PricePreview;
}

export interface Category {
  id: string;
  name: string;
}

// Params for GET /stocks/store/:storeId (primary catalog endpoint)
export interface CatalogStockParams {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Params for GET /stores/:storeId/products (secondary)
export interface CatalogProductsParams {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?:
    | "name"
    | "slug"
    | "sku"
    | "brand"
    | "price"
    | "categoryName"
    | "createdAt"
    | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
