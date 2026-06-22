import * as Yup from "yup";

export const voucherSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),

  code: Yup.string().trim().required("Code is required"),

  quantity: Yup.number()
    .typeError("Must be a number")
    .integer("Must be a whole number")
    .min(0, "Must be 0 or more")
    .required("Quantity is required"),

  discountType: Yup.string()
    .oneOf(["percentage", "nominal"], "Select a valid discount type")
    .required("Discount type is required"),

  voucherType: Yup.string()
    .oneOf(["transaction", "delivery"], "Select a valid voucher type")
    .required("Voucher type is required"),

  value: Yup.mixed().when("discountType", ([type]) => {
    if (type === "percentage") {
      return Yup.number()
        .typeError("Must be a number")
        .min(1, "Min 1%")
        .max(100, "Max 100%")
        .required("Value is required");
    }
    return Yup.number()
      .typeError("Must be a number")
      .min(1, "Must be positive")
      .required("Value is required");
  }),

  minimumTransaction: Yup.number()
    .transform((_, orig) => (orig === "" || orig == null ? undefined : Number(orig)))
    .min(0, "Must be 0 or more")
    .optional()
    .nullable(),

  maxDiscount: Yup.number()
    .transform((_, orig) => (orig === "" || orig == null ? undefined : Number(orig)))
    .min(0, "Must be 0 or more")
    .optional()
    .nullable(),

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

  isGlobal: Yup.boolean(),
});
