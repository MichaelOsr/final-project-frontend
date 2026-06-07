import { useEffect, useState } from "react";
import { Form, Formik, type FormikHelpers } from "formik";
import { ArrowLeftIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { ProductImageField } from "../components/ProductImageField";
import { ProductSelectField } from "../components/ProductSelectField";
import { createProductSchema } from "../schemas/adminProduct.schemas";
import { adminProductService } from "../services/adminProduct.service";
import type { CreateProductFormValues, ProductCategory } from "../types/adminProduct.types";

const initialValues: CreateProductFormValues = {
  name: "",
  categoryId: "",
  brand: "",
  variant: "",
  size: "",
  description: "",
  price: "",
  images: [],
};

export function CreateProductPage() {
  usePageTitle("Create product");
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const response = await adminProductService.listCategories();
        if (isMounted) setCategories(response.data.data ?? []);
      } catch (error) {
        if (isMounted) toast.error(getAdminErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(values: CreateProductFormValues, helpers: FormikHelpers<CreateProductFormValues>) {
    try {
      await adminProductService.create({
        name: values.name.trim(),
        categoryId: values.categoryId,
        brand: values.brand,
        variant: values.variant,
        size: values.size,
        description: values.description,
        price: Number(values.price),
        images: values.images,
      });
      toast.success("Product created successfully");
      navigate("/admin/products");
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      helpers.setSubmitting(false);
    }
  }

  return (
    <AdminDashboardShell>
      <div className="mx-auto grid w-full max-w-5xl gap-5">
        <Header />
        <Card className="rounded-lg">
          <CardHeader className="border-b border-border">
            <CardTitle>Product details</CardTitle>
            <p className="text-sm text-muted-foreground">Create catalog data and upload the initial product gallery.</p>
          </CardHeader>
          <CardContent className="p-5 md:p-6">
            <CreateProductForm categories={categories} isLoading={isLoading} onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  );
}

function Header() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Create Product</h1>
        <p className="text-sm text-muted-foreground">Only super admins can add new catalog products.</p>
      </div>
      <Button asChild variant="outline" className="w-fit">
        <Link to="/admin/products">
          <ArrowLeftIcon className="size-4" />
          Products
        </Link>
      </Button>
    </div>
  );
}

function CreateProductForm({
  categories,
  isLoading,
  onSubmit,
}: {
  categories: ProductCategory[];
  isLoading: boolean;
  onSubmit: (values: CreateProductFormValues, helpers: FormikHelpers<CreateProductFormValues>) => Promise<void>;
}) {
  return (
    <Formik initialValues={initialValues} validationSchema={createProductSchema} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="name" label="Name" placeholder="Indomie Goreng" />
            <ProductSelectField name="categoryId" label="Category" disabled={isLoading}>
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
          <ProductImageField />
          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">SKU and slug are generated by the backend after creation.</p>
            <Button type="submit" className="h-10 px-4" disabled={isLoading || isSubmitting}>
              {isSubmitting ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              Create Product
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
