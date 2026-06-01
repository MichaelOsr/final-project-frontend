import { Fragment } from "react";
import { Route } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminLoginPage } from "@/features/admin/auth/pages/AdminLoginPage";
import { AdminPublicOnlyRoute } from "@/features/admin/auth/components/AdminPublicOnlyRoute";
import { AdminProtectedRoute } from "@/features/admin/auth/components/AdminProtectedRoute";
import { AdminNotFound } from "@/features/admin/auth/components/AdminNotFound";
import { AdminDashboardPage } from "@/features/admin/dashboard/pages/AdminDashboardPage";

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
