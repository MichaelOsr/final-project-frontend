import api from "@/lib/axios"
import type { PaginatedResponse } from "@/types/api.types"
import type { GetProductsParams, Product } from "@/types/product.types"

// Thin wrapper around GET /products. The homepage passes a storeId so it only
// shows products available at the user's chosen store.
export const productService = {
  getProducts: (params: GetProductsParams) =>
    api.get<PaginatedResponse<Product>>("/products", { params }),
}
