import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { usePageTitle } from "@/hooks/usePageTitle"
import { SetPasswordForm } from "../components/SetPasswordForm"
import { authService } from "../services/auth.service"
import type { SetPasswordPayload } from "../types/auth.types"

export function ResetPasswordPage() {
  usePageTitle("Reset password")
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get("token")

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reset link invalid</CardTitle>
          <CardDescription>This link is missing or has expired.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/forgot-password" className="text-sm font-medium hover:underline">
            Request a new reset link
          </Link>
        </CardContent>
      </Card>
    )
  }

  const handleReset = async (values: SetPasswordPayload) => {
    const { data } = await authService.resetPassword(token, values)
    toast.success(data.message ?? "Password reset. Please sign in.")
    navigate("/login")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Reset password</CardTitle>
        <CardDescription>Choose a new password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        <SetPasswordForm onSubmit={handleReset} submitLabel="Reset password" />
      </CardContent>
    </Card>
  )
}
