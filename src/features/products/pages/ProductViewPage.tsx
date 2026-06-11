import { useParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLocation as useStoreLocation } from "@/features/home/hooks/useLocation";
import { ProductGallery } from "../components/ProductGallery";
import { AddToCartControl } from "../components/AddToCartControl";
import { useStoreProduct } from "../hooks/useStoreProduct";
import type { StoreProduct } from "../types/product.types";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
}

export function ProductViewPage() {
  const { storeId: routeStoreId, slug = "" } = useParams<{ storeId?: string; slug: string }>();
  const { storeId: locationStoreId } = useStoreLocation();
  const storeId = routeStoreId ?? locationStoreId ?? "";
  const { product, isLoading } = useStoreProduct(storeId, slug);
  usePageTitle(product?.name ?? "Product");

  if (isLoading) return <StateMessage message="Loading product..." />;
  if (!product) return <StateMessage message="Product not found." />;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfo product={product} storeId={storeId} />
      </div>
    </div>
  );
}

function ProductInfo({ product, storeId }: { product: StoreProduct; storeId: string }) {
  const { storeStock } = product;
  return (
    <div className="flex flex-col gap-6">
      <div>
        {product.brand && <p className="text-sm text-muted-foreground">{product.brand}</p>}
        <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
      </div>
      <p className="text-4xl font-bold text-primary">{formatPrice(product.price)}</p>
      <StockStatus stock={storeStock.stock} isAvailable={storeStock.isAvailable} storeName={storeStock.store.name} />
      <AddToCartControl productId={product.id} storeId={storeId} stock={storeStock.stock} isAvailable={storeStock.isAvailable} />
      <ProductMeta product={product} />
      {product.description && (
        <div>
          <h2 className="mb-2 text-sm font-semibold">Description</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        </div>
      )}
    </div>
  );
}

function StockStatus({ stock, isAvailable, storeName }: { stock: number; isAvailable: boolean; storeName: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span
        className={`rounded-full px-3 py-1 font-semibold ${
          isAvailable ? "bg-accent text-primary" : "bg-destructive/10 text-destructive"
        }`}
      >
        {isAvailable ? `In stock (${stock})` : "Out of stock"}
      </span>
      <span className="text-muted-foreground">at {storeName}</span>
    </div>
  );
}

function ProductMeta({ product }: { product: StoreProduct }) {
  const specs = [
    { label: "SKU", value: product.sku },
    { label: "Category", value: product.category.name },
    product.variant ? { label: "Variant", value: product.variant } : null,
    product.size ? { label: "Size", value: product.size } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <dl className="grid gap-2 border-t border-border pt-4 text-sm">
      {specs.map((spec) => (
        <div key={spec.label} className="flex gap-2">
          <dt className="font-semibold">{spec.label}:</dt>
          <dd className="text-muted-foreground">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function StateMessage({ message }: { message: string }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">{message}</div>
  );
}
