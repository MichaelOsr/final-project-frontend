import adminAxios from "@/lib/adminAxios";
import type {
  StockReportQuery,
  StockReportResponse,
} from "../types/stockReport.types";

// Single endpoint: summary + history items + pagination in one response.
export const stockReportService = {
  report: (params: StockReportQuery) =>
    adminAxios.get<StockReportResponse>("/admin/stock/reports", { params }),
};
