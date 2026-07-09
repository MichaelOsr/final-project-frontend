import { Fragment } from "react";
import { Route } from "react-router-dom";
import { AdminProtectedRoute } from "@/features/admin/auth/components/AdminProtectedRoute";
import { adminNavEntries } from "./adminNav.config";

export function buildAdminRoutes() {
  return (
    <Fragment>
      {adminNavEntries.map((entry) => (
        <Route
          key={entry.key}
          path={entry.path}
          element={
            <AdminProtectedRoute allowedRoles={entry.roles}>
              {entry.element}
            </AdminProtectedRoute>
          }
        />
      ))}
    </Fragment>
  );
}
