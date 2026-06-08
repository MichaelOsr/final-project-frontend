import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { usePageTitle } from "@/hooks/usePageTitle"
import { RegisterForm } from "../components/RegisterForm"
import { GoogleAuthButton } from "../components/GoogleAuthButton"


export function RegisterPage() {
  usePageTitle("Create account")
  return (
    <Card className="shadow-lg">
      <CardContent className="grid gap-5 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll email you a link to verify and set your password
          </p>
        </div>

        <RegisterForm />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <hr className="flex-1 border-border" />
          <span className="text-xs text-muted-foreground">Or continue with</span>
          <hr className="flex-1 border-border" />
        </div>

        {/* Google — UI only */}
        <GoogleAuthButton/>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
