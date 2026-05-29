import { useSearchParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { usePageTitle } from "@/hooks/usePageTitle"
import { SetPasswordForm } from "../components/SetPasswordForm"
import { ResendVerificationForm } from "../components/ResendVerificationForm"
import { authService } from "../services/auth.service"
import type { SetPasswordPayload } from "../types/auth.types"

export function VerifyEmailPage() {
  usePageTitle("Verify email")
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get("token")

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification link invalid</CardTitle>
          <CardDescription>This link is missing or has expired. Request a new one below.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResendVerificationForm />
        </CardContent>
      </Card>
    )
  }

  const handleVerify = async (values: SetPasswordPayload) => {
    const { data } = await authService.verifyEmail(token, values)
    toast.success(data.message ?? "Email verified. Please sign in.")
    navigate("/login")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Set your password</CardTitle>
        <CardDescription>Choose a password to finish verifying your account</CardDescription>
      </CardHeader>
      <CardContent>
        <SetPasswordForm onSubmit={handleVerify} submitLabel="Verify & set password" />
      </CardContent>
    </Card>
  )
}
