// Product shapes returned by GET /products.
// Mirrors the `productListInclude` selection in the backend repository.

export interface ProductImage {
  id: string
  image: string | null
  position: number
}

export interface ProductCategory {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  slug: string | null
  price: number
  brand: string | null
  variant: string | null
  size: string | null
  category: ProductCategory
  images: ProductImage[]
}

// Query params accepted by GET /products (subset used by the homepage).
export interface GetProductsParams {
  storeId?: string
  inStock?: boolean
  page?: number
  limit?: number
}
