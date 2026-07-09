import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";

export type SalesReportGranularity = "daily" | "monthly" | "yearly";

// Sales report only counts confirmed transactions (store revenue is realized
// on confirmation). "confirmed" is the sole valid status in the new contract.
export type SalesReportStatus = "confirmed";

export type ProductSortBy =
  | "productName"
  | "totalItemsSold"
  | "productSales";

export interface SalesReportCommonQuery {
  granularity?: SalesReportGranularity;
  storeId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ResolvedRange {
  startDate: string; // exact YYYY-MM-DD used by the backend query
  endDate: string;
}

export interface SalesReportFiltersInfo {
  granularity: SalesReportGranularity;
  storeId: string | null;
  startDate: string; // bucket label, e.g. "2026-01"
  endDate: string;
  resolvedRange: ResolvedRange;
}

export interface SalesTrendSummary {
  totalOrders: number;
  totalItemsSold: number;
  productSales: number;
  transactionVoucherDiscount: number;
  deliveryRevenue: number;
  totalRevenue: number;
  // Money-value discount (transaction vouchers + product %/nominal discounts),
  // excluding buy-X-get-Y and delivery vouchers.
  totalDiscountAmount: number;
  // Promotion usage count across transaction/delivery vouchers and all product
  // discounts, including buy-X-get-Y.
  totalPromotionUsed: number;
  averageOrderValue: number;
}

export interface SalesTrendPoint extends SalesTrendSummary {
  period: string;
}

export interface SalesTrendResponse {
  message: string;
  data: {
    filters: SalesReportFiltersInfo;
    summary: SalesTrendSummary;
    chart: SalesTrendPoint[];
  };
}

export interface CategoryShare {
  categoryId: string;
  categoryName: string;
  totalItemsSold: number;
  productSales: number;
  percentage: number;
}

export interface CategorySeries {
  key: string; // chart row key (categoryId)
  categoryId: string;
  categoryName: string;
  totalItemsSold: number;
  productSales: number;
}

export interface CategorySalesResponse {
  message: string;
  data: {
    filters: SalesReportFiltersInfo;
    summary: { totalItemsSold: number; productSales: number };
    chart: Record<string, string | number>[];
    series: CategorySeries[];
    share: CategoryShare[];
    items: {
      period: string;
      categoryId: string;
      categoryName: string;
      totalItemsSold: number;
      productSales: number;
    }[];
  };
}

// GET /categories/:categoryId — drilldown trend for a single category.
export interface CategoryTrendResponse {
  message: string;
  data: {
    filters: SalesReportFiltersInfo;
    category: { id: string; name: string };
    summary: { totalItemsSold: number; productSales: number };
    chart: { period: string; totalItemsSold: number; productSales: number }[];
  };
}

type ProductFilters = SalesReportFiltersInfo & {
  categoryId: string | null;
  q: string | null;
};

// GET /products — product sales per period (stacked-chart shape, like categories).
// Backend ranks by productSales, returns top `limit`, folds the rest into "Others".
export interface ProductSalesQuery extends SalesReportCommonQuery {
  categoryId?: string;
  q?: string;
  limit?: number; // default 8, max 50
  includeOthers?: boolean; // default true
}

export interface ProductSeries {
  key: string; // productId, or "Others"
  productId: string | null;
  productName: string;
  sku: string | null;
  categoryId: string | null;
  categoryName: string | null;
  totalItemsSold: number;
  productSales: number;
  isOthers: boolean;
}

export interface ProductPeriodItem extends ProductSeries {
  period: string;
}

export interface ProductSalesResponse {
  message: string;
  data: {
    filters: ProductFilters & { limit: number; includeOthers: boolean };
    summary: { totalItemsSold: number; productSales: number };
    chart: Record<string, string | number>[];
    series: ProductSeries[];
    items: ProductPeriodItem[];
  };
}

// GET /products/ranking — aggregate product ranking (sortable table).
export interface ProductRankingQuery extends SalesReportCommonQuery {
  categoryId?: string;
  q?: string;
  sortBy?: ProductSortBy;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ProductRankingItem {
  productId: string;
  productName: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  totalItemsSold: number;
  productSales: number;
}

export interface ProductRankingResponse {
  message: string;
  data: {
    filters: ProductFilters;
    summary: {
      totalProducts: number;
      totalItemsSold: number;
      productSales: number;
    };
    items: ProductRankingItem[];
  };
  meta: PaginationMeta;
}

export interface ProductTrendResponse {
  message: string;
  data: {
    filters: SalesReportFiltersInfo;
    product: {
      id: string;
      name: string;
      sku: string;
      category: { id: string; name: string };
    };
    summary: { totalItemsSold: number; productSales: number };
    chart: { period: string; totalItemsSold: number; productSales: number }[];
  };
}
