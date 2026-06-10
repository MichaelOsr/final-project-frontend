import * as Yup from "yup";

export const PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
export const PRODUCT_IMAGE_MAX_SIZE = 1024 * 1024;

export const createProductSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  categoryId: Yup.string().trim().required("Category is required"),
  brand: Yup.string().trim().optional(),
  variant: Yup.string().trim().optional(),
  size: Yup.string().trim().optional(),
  description: Yup.string().trim().optional(),
  price: Yup.number()
    .typeError("Price must be a number")
    .integer("Price must be a whole number")
    .positive("Price must be greater than 0")
    .required("Price is required"),
  images: Yup.array()
    .of(Yup.mixed<File>().required())
    .min(1, "Upload at least one image")
    .max(5, "Upload up to 5 images")
    .test("fileType", "Images must be JPG, PNG, or GIF", (files) =>
      (files ?? []).every((file) => PRODUCT_IMAGE_TYPES.includes(file.type)),
    )
    .test("fileSize", "Each image must be 1MB or smaller", (files) =>
      (files ?? []).every((file) => file.size <= PRODUCT_IMAGE_MAX_SIZE),
    )
    .required("Upload at least one image"),
});

export const editProductSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  categoryId: Yup.string().trim().required("Category is required"),
  brand: Yup.string().trim().optional(),
  variant: Yup.string().trim().optional(),
  size: Yup.string().trim().optional(),
  description: Yup.string().trim().optional(),
  price: Yup.number()
    .typeError("Price must be a number")
    .integer("Price must be a whole number")
    .positive("Price must be greater than 0")
    .required("Price is required"),
});
