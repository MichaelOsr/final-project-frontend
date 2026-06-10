import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { usePageTitle } from "@/hooks/usePageTitle"
import { ForgotPasswordForm } from "../components/ForgotPasswordForm"

export function ForgotPasswordPage() {
  usePageTitle("Forgot password")
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Forgot password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send a reset link</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ForgotPasswordForm />
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="hover:text-foreground">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
