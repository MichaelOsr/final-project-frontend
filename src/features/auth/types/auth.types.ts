// Request payloads for the auth endpoints. Field names match the backend Zod
// schemas in backend-grocery/src/modules/auth/auth.validation.ts.

export interface RegisterPayload {
  name: string
  email: string
  referralCode?: string
}

export interface LoginPayload {
  email: string
  password: string
}

// Used by both email verification (set password) and reset password.
export interface SetPasswordPayload {
  password: string
  confirmPassword: string
}

export interface EmailPayload {
  email: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
