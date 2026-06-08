import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { usePageTitle } from "@/hooks/usePageTitle"
import { LoginForm } from "../components/LoginForm"
import { GoogleAuthButton } from "../components/GoogleAuthButton"


export function LoginPage() {
  usePageTitle("Sign in")

  return (
    <Card className="shadow-lg">
      <CardContent className="grid gap-5 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue shopping</p>
        </div>

        <LoginForm />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <hr className="flex-1 border-border" />
          <span className="text-xs text-muted-foreground">Or continue with</span>
          <hr className="flex-1 border-border" />
        </div>

        {/* Google — UI only */}
        <GoogleAuthButton />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/forgot-password" className="hover:text-foreground">
            Forgot your password?
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
