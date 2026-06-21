import { useParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useLocation as useStoreLocation } from "@/features/home/hooks/useLocation";
import { useCatalogProducts } from "../hooks/useCatalogProducts";
import { CatalogSidebar } from "../components/CatalogSidebar";
import { CatalogSearchField } from "../components/CatalogSearchField";
import { CatalogFiltersDialog } from "../components/CatalogFiltersDialog";
import { CatalogHeader } from "../components/CatalogHeader";
import { CatalogToolbar } from "../components/CatalogToolbar";
import { CatalogGrid } from "../components/CatalogGrid";
import { CatalogPagination } from "../components/CatalogPagination";

export function ProductCatalogPage() {
  usePageTitle("Catalog");

  const { storeId: routeStoreId } = useParams<{ storeId?: string }>();
  const { storeId: locationStoreId } = useStoreLocation();
  const storeId = routeStoreId ?? locationStoreId;

  const { products, meta, isLoading, error } = useCatalogProducts(storeId);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <CatalogSidebar />
      <section className="flex-1 px-4 py-6 sm:px-6">
        {isDesktop ? (
          <div className="mb-6 flex items-center justify-between gap-3">
            <CatalogHeader meta={meta} productsCount={products.length} />
            <CatalogToolbar />
          </div>
        ) : (
          <div className="mb-6 flex flex-col gap-4">
            <CatalogHeader meta={meta} productsCount={products.length} />
            <CatalogSearchField />
            <CatalogFiltersDialog />
            <CatalogToolbar />
          </div>
        )}
        <CatalogGrid products={products} storeId={storeId} isLoading={isLoading} error={error} />
        <CatalogPagination meta={meta} />
      </section>
    </div>
  );
}
