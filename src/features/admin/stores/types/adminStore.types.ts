import type { StoreOverview } from "@/features/admin/shared/types/admin.types";

export type AdminStore = StoreOverview & {
  deletedAt?: string | null;
};

export interface StoreFormValues {
  name: string;
  latitude: string;
  longitude: string;
}

export interface StorePayload {
  name: string;
  latitude: string | null;
  longitude: string | null;
}
