import type { StoreOverview } from "@/features/admin/dashboard/types/adminDashboard.types";

export interface StoreDashboardAdmin {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isVerified: boolean;
  role: {
    id: string;
    name: string;
  };
}

export interface StoreDashboardSummary {
  store: StoreOverview;
  metrics: {
    totalStoreAdmins: number;
    totalVerifiedStoreAdmins: number;
  };
  storeAdmins: StoreDashboardAdmin[];
}
