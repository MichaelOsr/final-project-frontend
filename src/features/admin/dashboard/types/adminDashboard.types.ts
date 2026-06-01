export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardSummary {
  totalStores: number;
  totalRegisteredUsers: number;
  totalVerifiedUsers: number;
  totalAdminAccounts: number;
  totalStoreAdmins: number;
  totalSuperAdmins: number;
}

export interface StoreOverview {
  id: string;
  name: string;
  latitude: string | null;
  longitude: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountRole {
  id: string;
  name: string;
}

export interface AdminUserOverview {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isVerified: boolean;
  createdAt?: string;
  role?: AccountRole | null;
  store?: StoreOverview | null;
}

export interface DashboardState {
  summary: DashboardSummary | null;
  stores: StoreOverview[];
  adminAccounts: AdminUserOverview[];
  users: AdminUserOverview[];
}
