import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import { DeleteProductDialog } from "../components/DeleteProductDialog";
import { ProductImagePreviewDialog } from "../components/ProductImagePreviewDialog";
import { adminProductService } from "../services/adminProduct.service";
import type { AdminProduct, ProductStock } from "../types/adminProduct.types";

const priceFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function AdminProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  usePageTitle(product?.name ? `${product.name} details` : "Product details");

  useEffect(() => {
    if (!slug) return;
    const productSlug = slug;
    let isMounted = true;
    async function loadProduct() {
      try {
        const response = await adminProductService.getBySlug(productSlug);
        if (isMounted) setProduct(response.data.data ?? null);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  async function confirmDelete() {
    if (!product) return;
    setIsDeleting(true);
    try {
      await adminProductService.delete(product.slug);
      toast.success("Product deleted successfully");
      navigate("/admin/products");
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AdminDashboardShell>
      <div className="grid gap-5">
        <Header product={product} slug={slug} onDelete={() => setDeleteOpen(true)} />
        {isLoading ? (
          <Card className="rounded-lg"><CardContent className="p-5 text-sm text-muted-foreground">Loading product...</CardContent></Card>
        ) : product ? (
          <ProductDetail product={product} />
        ) : (
          <Card className="rounded-lg"><CardContent className="p-5 text-sm text-muted-foreground">Product was not found.</CardContent></Card>
        )}
      </div>
      <DeleteProductDialog
        isDeleting={isDeleting}
        open={deleteOpen}
        productName={product?.name ?? ""}
        onConfirm={confirmDelete}
        onOpenChange={setDeleteOpen}
      />
    </AdminDashboardShell>
  );
}

function Header({ product, slug, onDelete }: { product: AdminProduct | null; slug?: string; onDelete: () => void }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{product?.name ?? "Product Details"}</h1>
        <p className="text-sm text-muted-foreground">{product?.sku ?? "Catalog, images, and store stock."}</p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline"><Link to="/admin/products"><ArrowLeftIcon className="size-4" />Products</Link></Button>
        {slug ? <Button asChild><Link to={`/admin/products/${slug}/edit`}><PencilIcon className="size-4" />Edit</Link></Button> : null}
        {product ? <Button variant="destructive" onClick={onDelete}><Trash2Icon className="size-4" />Delete</Button> : null}
      </div>
    </div>
  );
}

function ProductDetail({ product }: { product: AdminProduct }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-5">
        <ProductInfo product={product} />
        <StockCard stocks={product.stocks ?? []} />
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

function StockCard({ stocks }: { stocks: ProductStock[] }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border"><CardTitle>Store stock</CardTitle></CardHeader>
      <CardContent className="grid gap-3 p-5">
        {stocks.length ? stocks.map((stock) => <StockRow key={stock.id} stock={stock} />) : (
          <p className="text-sm text-muted-foreground">This product does not have active stock rows yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function StockRow({ stock }: { stock: ProductStock }) {
  return (
    <div className="grid gap-2 rounded-lg bg-muted/50 p-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
      <div>
        <p className="font-medium">{stock.store?.name ?? "Unknown store"}</p>
        <p className="text-xs text-muted-foreground">
          Lat {stock.store?.latitude ?? "-"} · Long {stock.store?.longitude ?? "-"}
        </p>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-lg font-semibold">{stock.stock}</p>
        <p className="text-xs text-muted-foreground">units</p>
      </div>
    </div>
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
