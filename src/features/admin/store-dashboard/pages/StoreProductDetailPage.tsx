import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import { ProductImagePreviewDialog } from "@/features/admin/products/components/ProductImagePreviewDialog";
import { storeDashboardService } from "../services/storeDashboard.service";
import { useStoreContext } from "../hooks/useStoreContext";
import type { AdminProduct, ProductStock } from "@/features/admin/products/types/adminProduct.types";

const priceFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function StoreProductDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { storeId, isReady } = useStoreContext();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [storeStock, setStoreStock] = useState<ProductStock | null>(null);
  usePageTitle(product?.name ? `${product.name} details` : "Product details");

  useEffect(() => {
    if (!slug || !isReady) {
      setIsLoading(false);
      return;
    }
    let isMounted = true;

    async function loadProductAndStock() {
      try {
        const response = await storeDashboardService.getProductStock(storeId, slug);
        if (!isMounted) return;
        const stock = response.data.data ?? null;

        if (stock?.product) {
          setProduct(stock.product as unknown as AdminProduct);
          setStoreStock(stock);
        }
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProductAndStock();
    return () => {
      isMounted = false;
    };
  }, [slug, isReady, storeId]);

  return (
    <AdminDashboardShell>
      <div className="grid gap-5">
        <Header product={product} slug={slug} />
        {isLoading ? (
          <Card className="rounded-lg"><CardContent className="p-5 text-sm text-muted-foreground">Loading product...</CardContent></Card>
        ) : product ? (
          <ProductDetail product={product} storeStock={storeStock} />
        ) : (
          <Card className="rounded-lg"><CardContent className="p-5 text-sm text-muted-foreground">Product was not found.</CardContent></Card>
        )}
      </div>
    </AdminDashboardShell>
  );
}

function Header({ product, slug }: { product: AdminProduct | null; slug?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{product?.name ?? "Product Details"}</h1>
        <p className="text-sm text-muted-foreground">{product?.sku ?? "Store stock and product details."}</p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline"><Link to="/admin/store/stock"><ArrowLeftIcon className="size-4" />Back to Stock</Link></Button>
        {slug ? <Button asChild><Link to={`/admin/products/${slug}/edit`}><PencilIcon className="size-4" />Edit</Link></Button> : null}
      </div>
    </div>
  );
}

function ProductDetail({ product, storeStock }: { product: AdminProduct; storeStock: ProductStock | null }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-5">
        <ProductInfo product={product} />
        <StoreStockCard storeStock={storeStock} />
      </div>
      <ImageCard product={product} />
    </div>
  );
}

function ProductInfo({ product }: { product: AdminProduct }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border"><CardTitle>Product data</CardTitle></CardHeader>
      <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
        <DetailRow label="Name" value={product.name} />
        <DetailRow label="SKU" value={product.sku} />
        <DetailRow label="Category" value={product.category?.name ?? "-"} />
        <DetailRow label="Price" value={priceFormatter.format(product.price)} />
        <DetailRow label="Brand" value={product.brand ?? "-"} />
        <DetailRow label="Variant" value={product.variant ?? "-"} />
        <DetailRow label="Size" value={product.size ?? "-"} />
        <DetailRow label="Updated" value={formatDate(product.updatedAt)} />
        <div className="sm:col-span-2"><DetailRow label="Description" value={product.description ?? "-"} /></div>
      </CardContent>
    </Card>
  );
}

function ImageCard({ product }: { product: AdminProduct }) {
  const images = [...(product.images ?? [])].sort((a, b) => a.position - b.position);
  const [preview, setPreview] = useState("");
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border"><CardTitle>Images</CardTitle></CardHeader>
      <CardContent className="grid gap-3 p-4">
        {images.length ? images.map((image) => (
          <div key={image.id} className="grid gap-2">
            <button type="button" className="aspect-square overflow-hidden rounded-md" onClick={() => setPreview(image.image)}>
              <img src={image.image} alt={product.name} className="size-full object-cover object-top transition hover:scale-105" />
            </button>
          </div>
        )) : <p className="text-sm text-muted-foreground">No images available.</p>}
      </CardContent>
      <ProductImagePreviewDialog
        alt={product.name}
        image={preview}
        open={Boolean(preview)}
        title={product.name}
        onOpenChange={(open) => !open && setPreview("")}
      />
    </Card>
  );
}

function StoreStockCard({ storeStock }: { storeStock: ProductStock | null }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border"><CardTitle>Store stock</CardTitle></CardHeader>
      <CardContent className="p-5">
        {storeStock ? (
          <div className="grid gap-3">
            <div className="grid gap-2 rounded-lg bg-muted/50 p-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Stock Level</p>
                <p className="text-2xl font-semibold">{storeStock.stock}</p>
                <p className="text-xs text-muted-foreground">units available</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">{formatDate(storeStock.updatedAt)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No stock data for this store yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-lg bg-muted/50 p-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
