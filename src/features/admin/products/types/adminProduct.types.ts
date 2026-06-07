export interface ProductCategory {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ProductImage {
  id: string;
  productId?: string;
  image: string;
  publicId?: string;
  position: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ProductStockStore {
  id: string;
  name: string;
  latitude?: string | null;
  longitude?: string | null;
}

export interface ProductStock {
  id: string;
  productId: string;
  storeId: string;
  stock: number;
  store?: ProductStockStore | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  brand: string | null;
  variant: string | null;
  size: string | null;
  description: string | null;
  sku: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  category?: ProductCategory | null;
  images?: ProductImage[];
  stocks?: ProductStock[];
  stockHistories?: unknown[];
  discounts?: unknown[];
}

export interface CreateProductFormValues {
  name: string;
  categoryId: string;
  brand: string;
  variant: string;
  size: string;
  description: string;
  price: string;
  images: File[];
}

export interface EditProductFormValues {
  name: string;
  categoryId: string;
  brand: string;
  variant: string;
  size: string;
  description: string;
  price: string;
}

export type ProductGalleryItem =
  | {
      type: "existing";
      id: string;
      image: string;
      name: string;
    }
  | {
      type: "new";
      id: string;
      file: File;
    };
