import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { usePageTitle } from "@/hooks/usePageTitle"
import { RegisterForm } from "../components/RegisterForm"

export function RegisterPage() {
  usePageTitle("Create account")
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create your account</CardTitle>
        <CardDescription>We&apos;ll email you a link to verify and set your password</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
