// Standard response envelope returned by the backend.
// Success responses carry an optional `message` and/or `data`.
export interface ApiResponse<T = unknown> {
  message?: string
  data?: T
}

// Shape of an error body returned by the backend's error handler.
export interface ApiError {
  message: string
}

// Pagination info returned by list endpoints. Mirrors the backend's
// buildPaginationMeta helper. `meta` sits as a sibling of `data`.
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Envelope for paginated list endpoints (e.g. GET /products).
export interface PaginatedResponse<T> {
  message?: string
  data: T[]
  meta: PaginationMeta
}
