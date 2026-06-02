import type { StoreOverview } from "@/features/admin/dashboard/types/adminDashboard.types";

export interface StorePayload {
  name: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface StoreFormValues {
  name: string;
  latitude: string;
  longitude: string;
}

export type AdminStore = StoreOverview & {
  deletedAt?: string | null;
};
