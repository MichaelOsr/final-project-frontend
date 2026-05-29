// Mirrors the role values defined in the backend Prisma schema.
export type Role = "superAdmin" | "storeAdmin" | "user"

// Shape returned by GET /auth/me (the `data` field).
export interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  role: Role
  isVerified: boolean
  referralCode: string | null
}
