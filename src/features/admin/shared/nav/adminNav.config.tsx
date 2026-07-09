import type { ReactNode } from "react";
import {
  BarChart2Icon,
  BoxesIcon,
  LayoutDashboardIcon,
  PackageIcon,
  PercentIcon,
  ReceiptIcon,
  StoreIcon,
  TagsIcon,
  TicketIcon,
  TrendingUpIcon,
  UserCogIcon,
  type LucideIcon,
} from "lucide-react";
import type { AdminRoleName } from "@/types/adminAuthStore.types";
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
import { StockTabRedirect } from "@/features/admin/store-dashboard/pages/StockTabRedirect";
import { StoreStaffPage } from "@/features/admin/store-dashboard/pages/StoreStaffPage";
import { StoreProductDetailPage } from "@/features/admin/store-dashboard/pages/StoreProductDetailPage";
import { StoreDiscountsPage } from "@/features/admin/promos/pages/StoreDiscountsPage";
import { CreateDiscountPage } from "@/features/admin/promos/pages/CreateDiscountPage";
import { EditDiscountPage } from "@/features/admin/promos/pages/EditDiscountPage";
import { StoreVouchersPage } from "@/features/admin/promos/pages/StoreVouchersPage";
import { CreateVoucherPage } from "@/features/admin/promos/pages/CreateVoucherPage";
import { EditVoucherPage } from "@/features/admin/promos/pages/EditVoucherPage";
import { StorePromoReportsPage } from "@/features/admin/promos/pages/StorePromoReportsPage";
import { SuperVouchersPage } from "@/features/admin/promos/pages/SuperVouchersPage";
import { SuperCreateVoucherPage } from "@/features/admin/promos/pages/SuperCreateVoucherPage";
import { SuperEditVoucherPage } from "@/features/admin/promos/pages/SuperEditVoucherPage";
import { AdminOrdersPage } from "@/features/admin/orders/pages/AdminOrdersPage";
import { AdminOrderDetailPage } from "@/features/admin/orders/pages/AdminOrderDetailPage";
import { SalesReportsPage } from "@/features/admin/sales-reports/pages/SalesReportsPage";
import { StoreSalesReportsPage } from "@/features/admin/sales-reports/pages/StoreSalesReportsPage";
import { StockReportsPage } from "@/features/admin/stock-reports/pages/StockReportsPage";

export type NavGroup =
  | "overview"
  | "catalog"
  | "sales"
  | "promotions"
  | "reports"
  | "admin";

/**
 * "global": item only relevant to the platform-wide (super admin, no active store) view.
 * "store": item only relevant inside a specific store's admin area.
 * "any": item is relevant in both — its link carries the active storeId only when
 * the ambient context is currently "store" (mirrors the pre-registry Transactions behavior).
 */
export type NavContext = "global" | "store" | "any";

type AdminNavEntryBase = {
  key: string;
  roles: AdminRoleName[];
  context: NavContext;
  path: string;
  element: ReactNode;
};

export type AdminNavVisibleEntry = AdminNavEntryBase & {
  showInNav: true;
  label: string;
  icon: LucideIcon;
  group: NavGroup;
  order: number;
  end?: boolean;
};

export type AdminNavEntry =
  | AdminNavVisibleEntry
  | (AdminNavEntryBase & { showInNav: false });

export const adminNavEntries: AdminNavEntry[] = [
  // overview
  {
    key: "dashboard-global",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/dashboard",
    element: <AdminDashboardPage />,
    showInNav: true,
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    group: "overview",
    order: 10,
    end: true,
  },
  {
    key: "dashboard-store",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/dashboard",
    element: <StoreDashboardPage />,
    showInNav: true,
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    group: "overview",
    order: 10,
    end: true,
  },

  // catalog
  {
    key: "products",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/products",
    element: <AdminProductsPage />,
    showInNav: true,
    label: "Products",
    icon: PackageIcon,
    group: "catalog",
    order: 10,
  },
  {
    key: "products-new",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/products/new",
    element: <CreateProductPage />,
    showInNav: false,
  },
  {
    key: "products-detail",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/products/:slug",
    element: <AdminProductDetailPage />,
    showInNav: false,
  },
  {
    key: "products-edit",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/products/:slug/edit",
    element: <EditProductPage />,
    showInNav: false,
  },
  {
    key: "categories-global",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/categories",
    element: <AdminCategoriesPage />,
    showInNav: true,
    label: "Categories",
    icon: TagsIcon,
    group: "catalog",
    order: 20,
  },
  {
    key: "categories-store",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/categories",
    element: <StoreCategoriesPage />,
    showInNav: true,
    label: "Categories",
    icon: TagsIcon,
    group: "catalog",
    order: 20,
  },
  {
    key: "stock-global",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/stock-reports",
    element: <StockReportsPage />,
    showInNav: true,
    label: "Stock",
    icon: BoxesIcon,
    group: "catalog",
    order: 30,
  },
  {
    key: "stock-store",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/stock",
    element: <StoreStockPage />,
    showInNav: true,
    label: "Stock",
    icon: BoxesIcon,
    group: "catalog",
    order: 30,
  },
  {
    key: "stock-store-history",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/stock/history",
    element: <StockTabRedirect tab="report" />,
    showInNav: false,
  },
  {
    key: "stock-store-transfers",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/stock/transfers",
    element: <StockTabRedirect tab="transfers" />,
    showInNav: false,
  },
  {
    key: "stock-store-reports-legacy",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/stock-reports",
    element: <StockTabRedirect tab="report" />,
    showInNav: false,
  },
  {
    key: "stock-store-product-detail",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/products/:slug",
    element: <StoreProductDetailPage />,
    showInNav: false,
  },

  // sales
  {
    key: "transactions",
    roles: ["superAdmin", "storeAdmin"],
    context: "any",
    path: "/admin/orders",
    element: <AdminOrdersPage />,
    showInNav: true,
    label: "Transactions",
    icon: ReceiptIcon,
    group: "sales",
    order: 10,
  },
  {
    key: "transactions-detail",
    roles: ["superAdmin", "storeAdmin"],
    context: "any",
    path: "/admin/orders/:orderId",
    element: <AdminOrderDetailPage />,
    showInNav: false,
  },
  {
    key: "sales-reports-global",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/sales-reports",
    element: <SalesReportsPage />,
    showInNav: true,
    label: "Sales Reports",
    icon: TrendingUpIcon,
    group: "sales",
    order: 20,
  },
  {
    key: "sales-reports-store",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/sales-reports",
    element: <StoreSalesReportsPage />,
    showInNav: true,
    label: "Sales Reports",
    icon: TrendingUpIcon,
    group: "sales",
    order: 20,
  },

  // promotions
  {
    key: "vouchers-global",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/vouchers",
    element: <SuperVouchersPage />,
    showInNav: true,
    label: "Vouchers",
    icon: TicketIcon,
    group: "promotions",
    order: 10,
  },
  {
    key: "vouchers-global-new",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/vouchers/new",
    element: <SuperCreateVoucherPage />,
    showInNav: false,
  },
  {
    key: "vouchers-global-edit",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/vouchers/:id/edit",
    element: <SuperEditVoucherPage />,
    showInNav: false,
  },
  {
    key: "vouchers-store",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/vouchers",
    element: <StoreVouchersPage />,
    showInNav: true,
    label: "Vouchers",
    icon: TicketIcon,
    group: "promotions",
    order: 10,
  },
  {
    key: "vouchers-store-new",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/vouchers/new",
    element: <CreateVoucherPage />,
    showInNav: false,
  },
  {
    key: "vouchers-store-edit",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/vouchers/:id/edit",
    element: <EditVoucherPage />,
    showInNav: false,
  },
  {
    key: "discounts-store",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/discounts",
    element: <StoreDiscountsPage />,
    showInNav: true,
    label: "Discounts",
    icon: PercentIcon,
    group: "promotions",
    order: 20,
  },
  {
    key: "discounts-store-new",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/discounts/new",
    element: <CreateDiscountPage />,
    showInNav: false,
  },
  {
    key: "discounts-store-edit",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/discounts/:id/edit",
    element: <EditDiscountPage />,
    showInNav: false,
  },

  // reports (store-only; super admin's cross-store reports live in "sales"/"catalog" groups above)
  {
    key: "promo-reports-store",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/promo-reports",
    element: <StorePromoReportsPage />,
    showInNav: true,
    label: "Promo Reports",
    icon: BarChart2Icon,
    group: "reports",
    order: 10,
  },

  // admin
  {
    key: "stores",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/stores",
    element: <AdminStoresPage />,
    showInNav: true,
    label: "Stores",
    icon: StoreIcon,
    group: "admin",
    order: 10,
  },
  {
    key: "accounts",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/admin-accounts",
    element: <AdminAccountsPage />,
    showInNav: true,
    label: "Accounts",
    icon: UserCogIcon,
    group: "admin",
    order: 20,
  },
  {
    key: "accounts-new",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/admin-accounts/new",
    element: <CreateAdminAccountPage />,
    showInNav: false,
  },
  {
    key: "accounts-edit",
    roles: ["superAdmin"],
    context: "global",
    path: "/admin/admin-accounts/:id/edit",
    element: <EditAdminAccountPage />,
    showInNav: false,
  },
  {
    key: "staff-store",
    roles: ["superAdmin", "storeAdmin"],
    context: "store",
    path: "/admin/store/staff",
    element: <StoreStaffPage />,
    showInNav: true,
    label: "Staff",
    icon: UserCogIcon,
    group: "admin",
    order: 30,
  },
];

export const navGroupOrder: NavGroup[] = [
  "overview",
  "catalog",
  "sales",
  "promotions",
  "reports",
  "admin",
];
