import { Formik, Form, type FormikHelpers } from "formik"
import { toast } from "sonner"
import { TextField } from "@/components/form/TextField"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/error"
import { authService } from "../services/auth.service"
import { emailSchema } from "../schemas/auth.schemas"
import type { EmailPayload } from "../types/auth.types"

const initialValues: EmailPayload = { email: "" }

// Lets an unverified user request a fresh verification email (PRD requirement).
export function ResendVerificationForm() {
  const handleSubmit = async (values: EmailPayload, helpers: FormikHelpers<EmailPayload>) => {
    try {
      const { data } = await authService.resendVerification(values)
      toast.success(data.message ?? "A new verification link has been sent.")
      helpers.resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <Formik initialValues={initialValues} validationSchema={emailSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="grid gap-4">
          <TextField name="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Resend verification email"}
          </Button>
        </Form>
      )}
    </Formik>
  )
}
