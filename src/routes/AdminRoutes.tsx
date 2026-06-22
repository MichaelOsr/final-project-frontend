import { Fragment } from "react";
import { Navigate, Route } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminLoginPage } from "@/features/admin/auth/pages/AdminLoginPage";
import { AdminPublicOnlyRoute } from "@/features/admin/auth/components/AdminPublicOnlyRoute";
import { AdminProtectedRoute } from "@/features/admin/auth/components/AdminProtectedRoute";
import { AdminNotFound } from "@/features/admin/auth/components/AdminNotFound";
import { AdminAccountsPage } from "@/features/admin/admin-accounts/pages/AdminAccountsPage";
import { CreateAdminAccountPage } from "@/features/admin/admin-accounts/pages/CreateAdminAccountPage";
import { EditAdminAccountPage } from "@/features/admin/admin-accounts/pages/EditAdminAccountPage";
import { AdminCategoriesPage } from "@/features/admin/categories/pages/AdminCategoriesPage";
import { AdminDashboardPage } from "@/features/admin/dashboard/pages/AdminDashboardPage";
import { AdminProductDetailPage } from "@/features/admin/products/pages/AdminProductDetailPage";
import { AdminProductsPage } from "@/features/admin/products/pages/AdminProductsPage";
import { CreateProductPage } from "@/features/admin/products/pages/CreateProductPage";
import { EditProductPage } from "@/features/admin/products/pages/EditProductPage";
import { AdminStoresPage } from "@/features/admin/stores/pages/AdminStoresPage";
import { StoreDashboardPage } from "@/features/admin/store-dashboard/pages/StoreDashboardPage";
import { StoreCategoriesPage } from "@/features/admin/store-dashboard/pages/StoreCategoriesPage";
import { StoreStockPage } from "@/features/admin/store-dashboard/pages/StoreStockPage";
import { StoreStockHistoryPage } from "@/features/admin/store-dashboard/pages/StoreStockHistoryPage";
import { StoreStaffPage } from "@/features/admin/store-dashboard/pages/StoreStaffPage";
import { StoreProductDetailPage } from "@/features/admin/store-dashboard/pages/StoreProductDetailPage";
import { StoreTransfersPage } from "@/features/admin/store-dashboard/pages/StoreTransfersPage";
import { StoreDiscountsPage } from "@/features/admin/promos/pages/StoreDiscountsPage";
import { CreateDiscountPage } from "@/features/admin/promos/pages/CreateDiscountPage";
import { EditDiscountPage } from "@/features/admin/promos/pages/EditDiscountPage";
import { StoreVouchersPage } from "@/features/admin/promos/pages/StoreVouchersPage";
import { CreateVoucherPage } from "@/features/admin/promos/pages/CreateVoucherPage";
import { EditVoucherPage } from "@/features/admin/promos/pages/EditVoucherPage";
import { StorePromoReportsPage } from "@/features/admin/promos/pages/StorePromoReportsPage";
import { AdminOrdersPage } from "@/features/admin/orders/pages/AdminOrdersPage";
import { AdminOrderDetailPage } from "@/features/admin/orders/pages/AdminOrderDetailPage";

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
        path="/admin/store/categories"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <StoreCategoriesPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/stock"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <StoreStockPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/stock/history"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <StoreStockHistoryPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/stock/transfers"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <StoreTransfersPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/discounts"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <StoreDiscountsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/discounts/new"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <CreateDiscountPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/discounts/:id/edit"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <EditDiscountPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/vouchers"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <StoreVouchersPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/vouchers/new"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <CreateVoucherPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/vouchers/:id/edit"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <EditVoucherPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/promo-reports"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <StorePromoReportsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/staff"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <StoreStaffPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/store/products/:slug"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <StoreProductDetailPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <AdminProductsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <CreateProductPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/products/:slug"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <AdminProductDetailPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/products/:slug/edit"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <EditProductPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <AdminCategoriesPage />
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
        path="/admin/users"
        element={<Navigate to="/admin/admin-accounts" replace />}
      />
      <Route
        path="/admin/admin-accounts"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin"]}>
            <AdminAccountsPage />
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
        path="/admin/orders"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <AdminOrdersPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/orders/:orderId"
        element={
          <AdminProtectedRoute allowedRoles={["superAdmin", "storeAdmin"]}>
            <AdminOrderDetailPage />
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