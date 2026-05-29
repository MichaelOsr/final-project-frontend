import { Formik, Form, type FormikHelpers } from "formik"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { TextField } from "@/components/form/TextField"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth.store"
import { getErrorMessage } from "@/lib/error"
import { authService } from "../services/auth.service"
import { loginSchema } from "../schemas/auth.schemas"
import type { LoginPayload } from "../types/auth.types"

const initialValues: LoginPayload = { email: "", password: "" }

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/"

  const handleSubmit = async (values: LoginPayload, helpers: FormikHelpers<LoginPayload>) => {
    try {
      await authService.login(values)
      await fetchMe()
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <Formik initialValues={initialValues} validationSchema={loginSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="grid gap-4">
          <TextField name="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
          <TextField name="password" label="Password" type="password" autoComplete="current-password" />
          <Button type="submit" className="h-12 w-full rounded-full text-base" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Continue"}
          </Button>
        </Form>
      )}
    </Formik>
  )
}
