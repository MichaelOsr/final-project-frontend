import { Formik, Form, type FormikHelpers } from "formik"
import { toast } from "sonner"
import { TextField } from "@/components/form/TextField"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/error"
import { setPasswordSchema } from "../schemas/auth.schemas"
import type { SetPasswordPayload } from "../types/auth.types"

const initialValues: SetPasswordPayload = { password: "", confirmPassword: "" }

interface SetPasswordFormProps {
  // Performs the actual API call (verify email or reset password).
  onSubmit: (values: SetPasswordPayload) => Promise<void>
  submitLabel: string
}

// Reused by the email-verification and reset-password pages: both just collect
// a new password and confirmation, differing only in which endpoint they call.
export function SetPasswordForm({ onSubmit, submitLabel }: SetPasswordFormProps) {
  const handleSubmit = async (values: SetPasswordPayload, helpers: FormikHelpers<SetPasswordPayload>) => {
    try {
      await onSubmit(values)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <Formik initialValues={initialValues} validationSchema={setPasswordSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="grid gap-4">
          <TextField name="password" label="New password" type="password" autoComplete="new-password" />
          <TextField name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" />
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </Form>
      )}
    </Formik>
  )
}
