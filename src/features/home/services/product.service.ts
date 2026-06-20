import api from "@/lib/axios"
import type { PaginatedResponse } from "@/types/api.types"
import type { CatalogStockParams, StoreProduct } from "@/features/products/types/product.types"

export const productService = {
  getStoreStockItems: (storeId: string, params: CatalogStockParams) =>
    api.get<PaginatedResponse<StoreProduct>>(`/stocks/store/${storeId}`, { params }),
}
