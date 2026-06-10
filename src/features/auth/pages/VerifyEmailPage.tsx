import { useSearchParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { usePageTitle } from "@/hooks/usePageTitle"
import { SetPasswordForm } from "../components/SetPasswordForm"
import { ResendVerificationForm } from "../components/ResendVerificationForm"
import { authService } from "../services/auth.service"
import type { SetPasswordPayload } from "../types/auth.types"
import { useAuthStore } from "@/store/auth.store"
import { getErrorMessage } from "@/lib/error"
import { Button } from "@/components/ui/button"

export function VerifyEmailPage() {
  usePageTitle("Verify email")
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get("token")
  const status = useAuthStore((s) => s.status)
  const fetchMe = useAuthStore((s) => s.fetchMe)

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

  // CASE 1: user masih login → ini verifikasi GANTI EMAIL (tanpa password)
  if (status === "authenticated") {
    const handleConfirm = async () => {
      try {
        const { data } = await authService.verifyEmailChange(token)
        toast.success(data.message ?? "Email updated.")
        await fetchMe()
        navigate("/profile")
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Confirm your new email</CardTitle>
          <CardDescription>Click below to finish updating your email address</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleConfirm} size="lg" className="w-full">
            Confirm email change
          </Button>
        </CardContent>
      </Card>
    )
  }

  // CASE 2: belum login → ini verifikasi REGISTRASI (set password)
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
