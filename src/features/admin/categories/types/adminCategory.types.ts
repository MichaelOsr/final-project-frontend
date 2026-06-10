export interface AdminCategory {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CategoryFormValues {
  name: string;
}
