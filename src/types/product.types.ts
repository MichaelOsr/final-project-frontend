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

export interface ActiveDiscount {
  name: string;
  type: "percentage" | "nominal" | "buyXGetY";
  value: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  startDate: string;
  endDate: string;
}

export interface PricePreview {
  originalPrice: number;
  finalPrice: number | null;
  discountAmount: number | null;
  isDiscounted: boolean;
  label: string | null;
  calculationMode: "unitPrice" | "quantityBased" | "none";
}

// Query params accepted by GET /products (subset used by the homepage).
export interface GetProductsParams {
  storeId?: string
  inStock?: boolean
  page?: number
  limit?: number
}
