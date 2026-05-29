import api from "@/lib/axios"
import type { ApiResponse } from "@/types/api.types"
import type { User } from "@/types/user.types"
import type {
  RegisterPayload,
  LoginPayload,
  SetPasswordPayload,
  EmailPayload,
  ChangePasswordPayload,
} from "../types/auth.types"

// Thin wrapper around the /auth endpoints. Each method maps 1:1 to a backend
// route. Token cookies are handled automatically by the axios instance.
export const authService = {
  register: (payload: RegisterPayload) =>
    api.post<ApiResponse>("/auth/register", payload),

  verifyEmail: (token: string, payload: SetPasswordPayload) =>
    api.post<ApiResponse>("/auth/verification", payload, { params: { token } }),

  resendVerification: (payload: EmailPayload) =>
    api.post<ApiResponse>("/auth/resend-verification", payload),

  login: (payload: LoginPayload) =>
    api.post<ApiResponse>("/auth/login", payload),

  forgotPassword: (payload: EmailPayload) =>
    api.post<ApiResponse>("/auth/forgot-password", payload),

  resetPassword: (token: string, payload: SetPasswordPayload) =>
    api.post<ApiResponse>("/auth/reset-password", payload, { params: { token } }),

  getMe: () => api.get<ApiResponse<User>>("/auth/me"),

  // `formData` carries an optional `name` field and an optional `avatar` file.
  updateProfile: (formData: FormData) =>
    api.patch<ApiResponse>("/auth/profile", formData),

  changeEmail: (payload: EmailPayload) =>
    api.patch<ApiResponse>("/auth/email", payload),

  changePassword: (payload: ChangePasswordPayload) =>
    api.patch<ApiResponse>("/auth/password", payload),
}
