import * as Yup from "yup";

export const createTransferSchema = Yup.object({
  productId: Yup.string().required("Product is required"),
  fromStoreId: Yup.string().required("Source store is required"),
  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .integer("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .required("Quantity is required"),
  requestNotes: Yup.string().trim().max(255, "Notes must be 255 characters or fewer"),
});

export const transferActionSchema = Yup.object({
  notes: Yup.string().trim().max(255, "Notes must be 255 characters or fewer"),
});
