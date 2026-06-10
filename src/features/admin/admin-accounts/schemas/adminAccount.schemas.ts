import * as Yup from "yup";

export const createAdminAccountSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  email: Yup.string()
    .trim()
    .email("Email format is invalid")
    .required("Email format is invalid"),
  password: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[0-9]/, "Password must contain a number")
    .required("Password must be at least 8 characters"),
  roleName: Yup.string()
    .oneOf(["superAdmin", "storeAdmin"], "Role is required")
    .required("Role is required"),
  storeId: Yup.string().when("roleName", {
    is: "storeAdmin",
    then: (schema) => schema.required("Store ID is required for store admin"),
    otherwise: (schema) => schema.optional(),
  }),
});

export const editAdminAccountSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  password: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[0-9]/, "Password must contain a number")
    .optional(),
  roleName: Yup.string()
    .oneOf(["superAdmin", "storeAdmin"], "Role is required")
    .required("Role is required"),
  storeId: Yup.string().when("roleName", {
    is: "storeAdmin",
    then: (schema) => schema.required("Store ID is required for store admin"),
    otherwise: (schema) => schema.optional(),
  }),
});
