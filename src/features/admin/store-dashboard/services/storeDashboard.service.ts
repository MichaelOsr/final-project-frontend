import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { StoreDashboardSummary } from "../types/storeDashboard.types";

export const storeDashboardService = {
  getSummary: (storeId: string) =>
    adminAxios.get<ApiResponse<StoreDashboardSummary>>(`/admin/dashboard/stores/${storeId}/summary`),
};
