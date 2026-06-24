import adminAxios from "@/lib/adminAxios";
import type {
  CategorySalesResponse,
  ProductRankingQuery,
  ProductRankingResponse,
  ProductSalesQuery,
  ProductSalesResponse,
  ProductTrendResponse,
  SalesReportCommonQuery,
  SalesTrendResponse,
} from "../types/salesReport.types";

const BASE = "/admin/sales-reports";

export const salesReportService = {
  trend: (params: SalesReportCommonQuery) =>
    adminAxios.get<SalesTrendResponse>(BASE, { params }),
  categories: (params: SalesReportCommonQuery) =>
    adminAxios.get<CategorySalesResponse>(`${BASE}/categories`, { params }),
  products: (params: ProductSalesQuery) =>
    adminAxios.get<ProductSalesResponse>(`${BASE}/products`, { params }),
  productRanking: (params: ProductRankingQuery) =>
    adminAxios.get<ProductRankingResponse>(`${BASE}/products/ranking`, { params }),
  productTrend: (productId: string, params: SalesReportCommonQuery) =>
    adminAxios.get<ProductTrendResponse>(`${BASE}/products/${productId}/trend`, {
      params,
    }),
};
