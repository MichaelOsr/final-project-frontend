import type { StoreOverview } from "@/features/admin/shared/types/admin.types";

export interface StoreDashboardAdmin {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isVerified: boolean;
  role: {
    id: string;
    name: string;
  };
}

export interface StoreDashboardSummary {
  store: StoreOverview;
  metrics: {
    totalStoreAdmins: number;
    totalVerifiedStoreAdmins: number;
  };
  storeAdmins: StoreDashboardAdmin[];
}

export interface StockProduct {
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category: {
    id: string;
    name: string;
  };
  images: Array<{
    id: string;
    image: string;
    position: number;
  }>;
}

export interface StoreStock {
  id: string;
  productId: string;
  storeId: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product: StockProduct;
  store: {
    id: string;
    name: string;
  };
}

