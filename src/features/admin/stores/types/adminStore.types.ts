import type { StoreOverview } from "@/features/admin/shared/types/admin.types";

export type AdminStore = StoreOverview & {
  deletedAt?: string | null;
};
