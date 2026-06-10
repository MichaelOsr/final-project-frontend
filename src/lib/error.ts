import { AxiosError } from "axios"
import type { ApiError } from "@/types/api.types"

// Extracts a human-readable message from an unknown error.
// Backend errors arrive as `{ message: string }`, so prefer that when present.
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiError | undefined)?.message ?? fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}
