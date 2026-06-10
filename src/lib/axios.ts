import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

// Single axios instance for the whole app.
// `withCredentials` is required because the backend stores the access/refresh
// tokens in httpOnly cookies — the browser must send them on every request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

// The auth store registers a callback here so that, when a token refresh
// ultimately fails, the session can be cleared (guards then redirect to login).
// Using a registered handler instead of importing the store avoids a circular
// dependency between this module and the store.
let onUnauthorized: (() => void) | null = null
export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler
}

// Endpoints that must never trigger the refresh-and-retry cycle, to avoid loops.
const REFRESH_BYPASS = ["/auth/refresh", "/auth/login"]

// A single in-flight refresh promise shared across concurrent 401s, so we only
// hit /auth/refresh once even if many requests fail at the same time.
let refreshPromise: Promise<unknown> | null = null
function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = api.post("/auth/refresh").finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const url = original?.url ?? ""
    const canRefresh =
      error.response?.status === 401 &&
      original !== undefined &&
      !original._retried &&
      !REFRESH_BYPASS.some((path) => url.includes(path))

    if (!canRefresh) return Promise.reject(error)

    original._retried = true
    try {
      await refreshSession()
      return api(original)
    } catch (refreshError) {
      onUnauthorized?.()
      return Promise.reject(refreshError)
    }
  }
)

export default api
