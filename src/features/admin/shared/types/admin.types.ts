import type { AdminRoleName } from "@/types/adminAuthStore.types";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StoreOverview {
  id: string;
  name: string;
  latitude: string | null;
  longitude: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreOption {
  id: string;
  name: string;
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
  store?: StoreOption | null;
}

export interface AdminRoleOption {
  id: string;
  name: AdminRoleName;
  createdAt?: string;
  updatedAt?: string;
}
