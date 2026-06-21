import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { StoreProduct } from "../types/product.types";

export const productService = {
  getStoreProduct: (storeId: string, slug: string) =>
    api.get<ApiResponse<StoreProduct>>(`/stores/${storeId}/products/${slug}`),
};
