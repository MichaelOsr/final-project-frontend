import adminAxios from "@/lib/adminAxios";
import type { ApiResponse } from "@/types/api.types";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type { AdminProduct, ProductCategory } from "../types/adminProduct.types";

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

interface CreateProductPayload {
  name: string;
  categoryId: string;
  brand?: string;
  variant?: string;
  size?: string;
  description?: string;
  price: number;
  images: File[];
}

interface UpdateProductPayload {
  name: string;
  categoryId: string;
  brand: string | null;
  variant: string | null;
  size: string | null;
  description: string | null;
  price: number;
}

interface UpdateProductImagesPayload {
  existingImages: Array<{ id: string; position: number }>;
  newImages: File[];
  newImagePositions: number[];
}

export const adminProductService = {
  list: (params: Record<string, string | number>) =>
    adminAxios.get<PaginatedApiResponse<AdminProduct>>("/admin/product", { params }),
  getBySlug: (slug: string) =>
    adminAxios.get<ApiResponse<AdminProduct>>(`/admin/product/${slug}`),
  create: (payload: CreateProductPayload) =>
    adminAxios.post<ApiResponse<AdminProduct>>("/admin/product", toProductFormData(payload)),
  update: (slug: string, payload: UpdateProductPayload) =>
    adminAxios.patch<ApiResponse<AdminProduct>>(`/admin/product/${slug}`, payload),
  updateImages: (slug: string, payload: UpdateProductImagesPayload) =>
    adminAxios.patch<ApiResponse<AdminProduct>>(`/admin/product/${slug}/images`, toProductImagesFormData(payload)),
  delete: (slug: string) =>
    adminAxios.delete<ApiResponse<Pick<AdminProduct, "id" | "name" | "slug" | "images" | "stocks">>>(`/admin/product/${slug}`),
  listCategories: () =>
    adminAxios.get<PaginatedApiResponse<ProductCategory>>("/categories", {
      params: { page: 1, limit: 100, sortBy: "name", sortOrder: "asc" },
    }),
};

function toProductFormData(payload: CreateProductPayload) {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("categoryId", payload.categoryId);
  formData.append("price", String(payload.price));
  appendOptional(formData, "brand", payload.brand);
  appendOptional(formData, "variant", payload.variant);
  appendOptional(formData, "size", payload.size);
  appendOptional(formData, "description", payload.description);
  formData.append("positions", JSON.stringify(payload.images.map((_, index) => index + 1)));
  payload.images.forEach((file) => formData.append("images", file));
  return formData;
}

function appendOptional(formData: FormData, key: string, value?: string) {
  if (value?.trim()) formData.append(key, value.trim());
}

function toProductImagesFormData(payload: UpdateProductImagesPayload) {
  const formData = new FormData();
  formData.append("existingImages", JSON.stringify(payload.existingImages));
  formData.append("newImagePositions", JSON.stringify(payload.newImagePositions));
  payload.newImages.forEach((file) => formData.append("images", file));
  return formData;
}
