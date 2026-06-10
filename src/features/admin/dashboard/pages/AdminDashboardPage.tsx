import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import {
  DashboardErrorState,
  DashboardLoadingState,
} from "../components/DashboardFeedback";
import { DashboardMetrics } from "../components/DashboardMetrics";
import { DashboardQuickActions } from "../components/DashboardQuickActions";
import { PeopleTable, StoresTable } from "../components/DashboardTables";
import { adminDashboardService } from "../services/adminDashboard.service";
import type { DashboardState } from "../types/adminDashboard.types";

const emptyDashboardState: DashboardState = {
  summary: null,
  stores: [],
  adminAccounts: [],
  users: [],
};

export function AdminDashboardPage() {
  usePageTitle("Super admin dashboard");
  const navigate = useNavigate();
  const clearSession = useAdminSessionStore((state) => state.clearSession);
  const [dashboard, setDashboard] = useState(emptyDashboardState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleDashboardError = useCallback(
    (requestError: unknown) => {
      if (requestError instanceof AxiosError && requestError.response?.status === 401) {
        clearSession();
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(getDashboardErrorMessage(requestError));
    },
    [clearSession, navigate],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [summary, stores, admins, users] = await Promise.all([
          adminDashboardService.summary(),
          adminDashboardService.recentStores(),
          adminDashboardService.recentAdminAccounts(),
          adminDashboardService.recentUsers(),
        ]);

        if (!isMounted) return;

        setDashboard({
          summary: summary.data.data ?? null,
          stores: stores.data.data ?? [],
          adminAccounts: admins.data.data ?? [],
          users: users.data.data ?? [],
        });
      } catch (requestError) {
        if (!isMounted) return;
        handleDashboardError(requestError);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [handleDashboardError, reloadKey]);

  if (isLoading) return <DashboardLoadingState />;

  if (error) {
    return (
      <DashboardErrorState
        message={error}
        onRetry={() => setReloadKey((key) => key + 1)}
      />
    );
  }

  return (
    <AdminDashboardShell>
      <DashboardMetrics summary={dashboard.summary} />
      <DashboardQuickActions />
      <section className="grid gap-4 xl:grid-cols-2">
        <StoresTable stores={dashboard.stores} />
        <PeopleTable
          title="Recent Admin Accounts"
          people={dashboard.adminAccounts}
          showStore
        />
      </section>
      <PeopleTable title="Recent Registered Users" people={dashboard.users} />
    </AdminDashboardShell>
  );
}

function getDashboardErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? "Please try again.";
  }

  return "Please try again.";
}
