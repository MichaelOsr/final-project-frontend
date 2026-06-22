import * as Yup from "yup";

export const discountSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),

  type: Yup.string()
    .oneOf(["percentage", "nominal", "buyXGetY"], "Select a valid type")
    .required("Type is required"),

  value: Yup.mixed().when("type", ([type]) => {
    if (type === "percentage") {
      return Yup.number()
        .typeError("Value must be a number")
        .min(1, "Min 1%")
        .max(100, "Max 100%")
        .required("Value is required");
    }
    if (type === "nominal") {
      return Yup.number()
        .typeError("Value must be a number")
        .min(1, "Must be positive")
        .required("Value is required");
    }
    return Yup.mixed().optional().nullable();
  }),

  buyQuantity: Yup.mixed().when("type", ([type]) => {
    if (type === "buyXGetY") {
      return Yup.number()
        .typeError("Must be a number")
        .integer("Must be whole number")
        .min(1, "Min 1")
        .required("Buy quantity is required");
    }
    return Yup.mixed().optional().nullable();
  }),

  getQuantity: Yup.mixed().when("type", ([type]) => {
    if (type === "buyXGetY") {
      return Yup.number()
        .typeError("Must be a number")
        .integer("Must be whole number")
        .min(1, "Min 1")
        .required("Get quantity is required");
    }
    return Yup.mixed().optional().nullable();
  }),

  quota: Yup.number()
    .transform((_, orig) => (orig === "" || orig == null ? undefined : Number(orig)))
    .integer("Must be a whole number")
    .min(1, "Must be at least 1")
    .optional()
    .nullable(),

  productId: Yup.string().required("Product is required"),

  startDate: Yup.string()
    .required("Start date is required")
    .test("start-before-end", "Start must be on or before end date & time", function (value) {
      const { endDate } = this.parent;
      if (!endDate || !value) return true;
      return value <= endDate;
    }),

  endDate: Yup.string()
    .required("End date is required")
    .test("end-after-start", "End must be on or after start date & time", function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      return value >= startDate;
    }),
});
