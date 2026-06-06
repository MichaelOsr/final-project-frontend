import * as Yup from "yup";

export const adminLoginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Email format is invalid")
    .required("Email format is invalid"),
  password: Yup.string().min(1, "Password is required").required("Password is required"),
});
