import { AxiosError } from "axios";
import type { ApiError } from "@/types/api.types";

export function getAdminErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiError | undefined)?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
