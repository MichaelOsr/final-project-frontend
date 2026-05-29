import * as Yup from "yup"

// Mirrors the backend password rule: min 8 chars, one uppercase, one digit.
const password = Yup.string()
  .min(8, "Password must be at least 8 characters")
  .matches(/[A-Z]/, "Password must contain an uppercase letter")
  .matches(/[0-9]/, "Password must contain a number")
  .required("Password is required")

export const registerSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  referralCode: Yup.string(),
})

export const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().required("Password is required"),
})

// Shared by email verification (set password) and reset password.
export const setPasswordSchema = Yup.object({
  password,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
})

export const emailSchema = Yup.object({
  email: Yup.string().email("Invalid email format").required("Email is required"),
})

export const updateProfileSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
})

export const changePasswordSchema = Yup.object({
  oldPassword: Yup.string().required("Current password is required"),
  newPassword: password,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm your password"),
})
