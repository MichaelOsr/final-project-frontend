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
