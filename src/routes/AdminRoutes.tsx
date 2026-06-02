import { Fragment } from "react";
import { Navigate, Route } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminLoginPage } from "@/features/admin/auth/pages/AdminLoginPage";
import { AdminPublicOnlyRoute } from "@/features/admin/auth/components/AdminPublicOnlyRoute";
import { AdminProtectedRoute } from "@/features/admin/auth/components/AdminProtectedRoute";
import { AdminNotFound } from "@/features/admin/auth/components/AdminNotFound";
import { CreateAdminAccountPage } from "@/features/admin/admin-accounts/pages/CreateAdminAccountPage";
import { EditAdminAccountPage } from "@/features/admin/admin-accounts/pages/EditAdminAccountPage";
import { AdminDashboardPage } from "@/features/admin/dashboard/pages/AdminDashboardPage";
import { AdminUsersPage } from "@/features/admin/users/pages/AdminUsersPage";
import { AdminStoresPage } from "@/features/admin/stores/pages/AdminStoresPage";
import { CreateStorePage } from "@/features/admin/stores/pages/CreateStorePage";
import { EditStorePage } from "@/features/admin/stores/pages/EditStorePage";
import { StoreDashboardPage } from "@/features/admin/store-dashboard/pages/StoreDashboardPage";

export const adminRoutes = (
  <Fragment>
    <Route element={<AuthLayout />}>
      <Route
        path="/admin/login"
        element={
          <AdminPublicOnlyRoute>
            <AdminLoginPage />
          </AdminPublicOnlyRoute>
        }
      />
    </Route>

    <Route element={<AdminLayout />}>
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/dashboard"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <StoreDashboardPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <AdminStoresPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/stores/new"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <CreateStorePage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/stores/:id/edit"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <EditStorePage />
          </AdminProtectedRoute>
        }
      />
      <Route path="/admin/users" element={<Navigate to="/admin/admin-accounts" replace />} />
      <Route
        path="/admin/admin-accounts"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <AdminUsersPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/admin-accounts/new"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <CreateAdminAccountPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/admin-accounts/:id/edit"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <EditAdminAccountPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <AdminProtectedRoute>
            <AdminNotFound />
          </AdminProtectedRoute>
        }
      />
    </Route>
  </Fragment>
);
