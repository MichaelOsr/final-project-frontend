import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { usePageTitle } from "@/hooks/usePageTitle"
import { LoginForm } from "../components/LoginForm"

export function LoginPage() {
  usePageTitle("Sign in")
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Welcome back</CardTitle>
        <CardDescription>Sign in to continue shopping</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <LoginForm />
        <div className="grid gap-1 text-center text-sm text-muted-foreground">
          <Link to="/forgot-password" className="hover:text-foreground">
            Forgot your password?
          </Link>
          <span>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
