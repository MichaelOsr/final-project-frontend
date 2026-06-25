import adminAxios from "@/lib/adminAxios";
import type {
  CategorySalesResponse,
  CategoryTrendResponse,
  ProductRankingQuery,
  ProductRankingResponse,
  ProductSalesQuery,
  ProductSalesResponse,
  ProductTrendResponse,
  SalesReportCommonQuery,
  SalesTrendResponse,
} from "../types/salesReport.types";
import type {
  TransactionReportQuery,
  TransactionReportResponse,
} from "../types/transactionReport.types";

const BASE = "/admin/sales-reports";

export const salesReportService = {
  trend: (params: SalesReportCommonQuery) =>
    adminAxios.get<SalesTrendResponse>(BASE, { params }),
  transactions: (params: TransactionReportQuery) =>
    adminAxios.get<TransactionReportResponse>(`${BASE}/transactions`, { params }),
  categories: (params: SalesReportCommonQuery) =>
    adminAxios.get<CategorySalesResponse>(`${BASE}/categories`, { params }),
  categoryTrend: (categoryId: string, params: SalesReportCommonQuery) =>
    adminAxios.get<CategoryTrendResponse>(`${BASE}/categories/${categoryId}`, {
      params,
    }),
  products: (params: ProductSalesQuery) =>
    adminAxios.get<ProductSalesResponse>(`${BASE}/products`, { params }),
  productRanking: (params: ProductRankingQuery) =>
    adminAxios.get<ProductRankingResponse>(`${BASE}/products/ranking`, { params }),
  productTrend: (productId: string, params: SalesReportCommonQuery) =>
    adminAxios.get<ProductTrendResponse>(`${BASE}/products/${productId}`, {
      params,
    }),
};
