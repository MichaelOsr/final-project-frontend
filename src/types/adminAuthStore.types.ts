export type AdminRoleName = "superAdmin" | "storeAdmin" | "user"

export interface IAdminStore {
  id: string
  name: string
  latitude: string
  longitude: string
}

export interface IAdminSessionUser {
  id: string
  email: string
  name: string
  avatar: string | null
  isVerified: boolean
  role: AdminRoleName
  roleId?: string
  store: IAdminStore | null
}
