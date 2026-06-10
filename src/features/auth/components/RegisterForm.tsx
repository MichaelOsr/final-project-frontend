import { Formik, Form, type FormikHelpers } from "formik"
import { toast } from "sonner"
import { TextField } from "@/components/form/TextField"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/error"
import { authService } from "../services/auth.service"
import { registerSchema } from "../schemas/auth.schemas"
import type { RegisterPayload } from "../types/auth.types"

const initialValues: RegisterPayload = { name: "", email: "", referralCode: "" }

export function RegisterForm() {
  const handleSubmit = async (values: RegisterPayload, helpers: FormikHelpers<RegisterPayload>) => {
    try {
      const { data } = await authService.register(values)
      toast.success(data.message ?? "Check your email to verify your account.")
      helpers.resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <Formik initialValues={initialValues} validationSchema={registerSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="grid gap-4">
          <TextField name="name" label="Full name" placeholder="Jane Doe" autoComplete="name" />
          <TextField name="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
          <TextField name="referralCode" label="Referral code (optional)" placeholder="ABC123" />
          <Button type="submit" className="h-12 w-full rounded-full text-base" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Continue"}
          </Button>
        </Form>
      )}
    </Formik>
  )
}
