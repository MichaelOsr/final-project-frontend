import { Fragment } from "react";
import { Navigate, Route } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminLoginPage } from "@/features/admin/auth/pages/AdminLoginPage";
import { AdminPublicOnlyRoute } from "@/features/admin/auth/components/AdminPublicOnlyRoute";
import { AdminProtectedRoute } from "@/features/admin/auth/components/AdminProtectedRoute";
import { AdminNotFound } from "@/features/admin/auth/components/AdminNotFound";
import { buildAdminRoutes } from "@/features/admin/shared/nav/buildAdminRoutes";

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
      {buildAdminRoutes()}
      <Route
        path="/admin/users"
        element={<Navigate to="/admin/admin-accounts" replace />}
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
