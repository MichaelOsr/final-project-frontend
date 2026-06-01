import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type {
  AdminUserOverview,
  DashboardSummary,
  PaginationMeta,
  StoreOverview,
} from "../types/adminDashboard.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

const recentListParams = {
  page: 1,
  limit: 5,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const adminDashboardService = {
  summary: () =>
    adminAxios.get<ApiResponse<DashboardSummary>>("/admin/dashboard/summary"),
  recentStores: () =>
    adminAxios.get<PaginatedApiResponse<StoreOverview>>("/stores", {
      params: recentListParams,
    }),
  recentAdminAccounts: () =>
    adminAxios.get<PaginatedApiResponse<AdminUserOverview>>(
      "/admin/admin-accounts",
      { params: recentListParams },
    ),
  recentUsers: () =>
    adminAxios.get<PaginatedApiResponse<AdminUserOverview>>("/admin/users", {
      params: recentListParams,
    }),
};
