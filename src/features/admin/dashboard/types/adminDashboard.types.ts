import type { AdminUserOverview, StoreOverview } from "@/features/admin/shared/types/admin.types";

export type { AdminUserOverview, PaginationMeta, StoreOverview } from "@/features/admin/shared/types/admin.types";

export interface DashboardSummary {
  totalStores: number;
  totalRegisteredUsers: number;
  totalVerifiedUsers: number;
  totalAdminAccounts: number;
  totalStoreAdmins: number;
  totalSuperAdmins: number;
}

export interface DashboardState {
  summary: DashboardSummary | null;
  stores: StoreOverview[];
  adminAccounts: AdminUserOverview[];
  users: AdminUserOverview[];
}
