import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { getAdminErrorMessage } from "@/features/admin/auth/utils/adminError";

export type ReportErrorResult = "forbidden" | "handled";

/**
 * Resolves admin report request failures per the API contract:
 * 401 clears the session and redirects to login, 403 signals an access-denied
 * state, and any other error is surfaced as a toast near the filters.
 */
export function useReportError() {
  const navigate = useNavigate();
  const clearSession = useAdminSessionStore((state) => state.clearSession);

  return useCallback(
    (error: unknown): ReportErrorResult => {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      if (status === 401) {
        clearSession();
        navigate("/admin/login", { replace: true });
        return "handled";
      }
      if (status === 403) return "forbidden";
      toast.error(getAdminErrorMessage(error));
      return "handled";
    },
    [clearSession, navigate],
  );
}
