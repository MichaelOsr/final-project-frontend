import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type { CatalogProductsParams, Category, StoreProduct } from "../types/product.types";

export const productService = {
  getStoreProduct: (storeId: string, slug: string) =>
    api.get<ApiResponse<StoreProduct>>(`/stores/${storeId}/products/${slug}`),

  getStoreProducts: (storeId: string, params: CatalogProductsParams) =>
    api.get<PaginatedResponse<StoreProduct>>(`/stores/${storeId}/products`, { params }),

  getCategories: () =>
    api.get<PaginatedResponse<Category>>("/categories", { params: { limit: 100 } }),
};
