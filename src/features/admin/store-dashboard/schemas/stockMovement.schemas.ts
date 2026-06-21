import * as Yup from "yup";
import { STOCK_MOVEMENT_TYPE_OPTIONS } from "../utils/stockMovement";

const movementTypeValues = STOCK_MOVEMENT_TYPE_OPTIONS.map((option) => option.value);

export const stockMovementSchema = Yup.object({
  type: Yup.string().oneOf(movementTypeValues, "Select a valid movement type").required("Movement type is required"),
  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .integer("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .required("Quantity is required"),
  notes: Yup.string().trim().max(255, "Notes must be 255 characters or fewer"),
});

export const clearStockSchema = Yup.object({
  notes: Yup.string().trim().max(255, "Notes must be 255 characters or fewer"),
});
