import { Routes, Route } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/PublicOnlyRoute";
import { NotFound } from "@/components/NotFound";
import { HomePage } from "@/features/home/pages/HomePage";
import { ProductViewPage } from "@/features/products/pages/ProductViewPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { ProfilePage } from "@/features/auth/pages/ProfilePage";
import { adminRoutes } from "@/routes/AdminRoutes";
import { CartPage } from "@/features/cart/pages/CartPage";
import { CheckoutPage } from "@/features/order/pages/CheckoutPage";
import { OrderListPage } from "@/features/order/pages/OrderListPage";
import { OrderDetailPage } from "@/features/order/pages/OrderDetailPage";
import { ProductCatalogPage } from "@/features/products/pages/ProductCatalogPage";
import { ManualTransferPage } from "@/features/order/pages/ManualTransferPage";
import { MidtransPaymentPage } from "@/features/order/pages/MidtransPaymentPage";

// Single source of truth for routes. Each team member adds their feature's
// pages here. Token-driven pages (verification, reset) stay accessible to any
// auth state; login/register/forgot are for logged-out users only.
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:slug" element={<ProductViewPage />} />
        <Route
          path="/stores/:storeId/products/:slug"
          element={<ProductViewPage />}
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/products-catalog" element={<ProductCatalogPage />} />
        <Route
          path="/products-catalog/:storeId"
          element={<ProductCatalogPage />}
        />
        <Route
          path="/payment/manual-transfer/:orderId"
          element={
            <ProtectedRoute>
              <ManualTransferPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/midtrans/:orderId"
          element={
            <ProtectedRoute>
              <MidtransPaymentPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/verification" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {adminRoutes}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
