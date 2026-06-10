import { useEffect, useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { ProductGalleryEditor } from "../components/ProductGalleryEditor";
import { ProductSelectField } from "../components/ProductSelectField";
import { editProductSchema } from "../schemas/adminProduct.schemas";
import { adminProductService } from "../services/adminProduct.service";
import type { AdminProduct, EditProductFormValues, ProductCategory, ProductGalleryItem } from "../types/adminProduct.types";
import { toGalleryItems, toImagesPayload, validateGallery } from "../utils/productGallery";

const emptyValues: EditProductFormValues = { name: "", categoryId: "", brand: "", variant: "", size: "", description: "", price: "" };

export function EditProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [galleryItems, setGalleryItems] = useState<ProductGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  usePageTitle(product?.name ? `Edit ${product.name}` : "Edit product");

  useEffect(() => {
    if (!slug) return;
    const productSlug = slug;
    let isMounted = true;
    async function loadEditData() {
      try {
        const [productResponse, categoriesResponse] = await Promise.all([
          adminProductService.getBySlug(productSlug),
          adminProductService.listCategories(),
        ]);
        if (!isMounted) return;
        const nextProduct = productResponse.data.data ?? null;
        setProduct(nextProduct);
        setGalleryItems(toGalleryItems(nextProduct));
        setCategories(categoriesResponse.data.data ?? []);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadEditData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  async function handleSubmit(values: EditProductFormValues, helpers: FormikHelpers<EditProductFormValues>) {
    if (!slug) return;
    const galleryError = validateGallery(galleryItems);
    if (galleryError) {
      toast.error(galleryError);
      helpers.setSubmitting(false);
      return;
    }
    try {
      const response = await adminProductService.update(slug, toUpdatePayload(values));
      const nextSlug = response.data.data?.slug ?? slug;
      await adminProductService.updateImages(nextSlug, toImagesPayload(galleryItems));
      toast.success("Product updated successfully");
      navigate(`/admin/products/${nextSlug}`);
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      helpers.setSubmitting(false);
    }
  }

  return (
    <AdminDashboardShell>
      <div className="mx-auto grid w-full max-w-5xl gap-5">
        <Header product={product} slug={slug} />
        <Card className="rounded-lg">
          <CardHeader className="border-b border-border">
            <CardTitle>Product data</CardTitle>
            <p className="text-sm text-muted-foreground">Update catalog fields and final gallery order.</p>
          </CardHeader>
          <CardContent className="p-5 md:p-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading product...</p>
            ) : (
              <EditProductForm categories={categories} galleryItems={galleryItems} initialValues={product ? toFormValues(product) : emptyValues} onChangeGallery={setGalleryItems} onSubmit={handleSubmit} />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  );
}

function Header({ product, slug }: { product: AdminProduct | null; slug?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <p className="text-sm text-muted-foreground">{product?.sku ?? "Update product catalog data."}</p>
      </div>
      <Button asChild variant="outline" className="w-fit">
        <Link to={slug ? `/admin/products/${slug}` : "/admin/products"}>
          <ArrowLeftIcon className="size-4" />
          Product Details
        </Link>
      </Button>
    </div>
  );
}

function EditProductForm({
  categories,
  galleryItems,
  initialValues,
  onChangeGallery,
  onSubmit,
}: {
  categories: ProductCategory[];
  galleryItems: ProductGalleryItem[];
  initialValues: EditProductFormValues;
  onChangeGallery: (items: ProductGalleryItem[]) => void;
  onSubmit: (values: EditProductFormValues, helpers: FormikHelpers<EditProductFormValues>) => Promise<void>;
}) {
  return (
    <Formik enableReinitialize initialValues={initialValues} validationSchema={editProductSchema} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="name" label="Name" placeholder="Indomie Goreng" />
            <ProductSelectField name="categoryId" label="Category">
              <option value="">Select category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </ProductSelectField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TextField name="brand" label="Brand" placeholder="Indomie" />
            <TextField name="variant" label="Variant" placeholder="Original" />
            <TextField name="size" label="Size" placeholder="85g" />
            <TextField name="price" label="Price" type="number" min="1" placeholder="3500" />
          </div>
          <TextField name="description" label="Description" placeholder="Instant fried noodle" />
          <ProductGalleryEditor items={galleryItems} onChange={onChangeGallery} />
          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">Empty optional fields are sent as null. Gallery must keep 1 to 5 images.</p>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              Save Changes
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

function toFormValues(product: AdminProduct): EditProductFormValues {
  return {
    name: product.name,
    categoryId: product.categoryId,
    brand: product.brand ?? "",
    variant: product.variant ?? "",
    size: product.size ?? "",
    description: product.description ?? "",
    price: String(product.price),
  };
}

function toUpdatePayload(values: EditProductFormValues) {
  return {
    name: values.name.trim(),
    categoryId: values.categoryId,
    brand: toNullable(values.brand),
    variant: toNullable(values.variant),
    size: toNullable(values.size),
    description: toNullable(values.description),
    price: Number(values.price),
  };
}

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
