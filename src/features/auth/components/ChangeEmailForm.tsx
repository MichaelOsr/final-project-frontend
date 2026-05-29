import { Formik, Form, type FormikHelpers } from "formik"
import { toast } from "sonner"
import { TextField } from "@/components/form/TextField"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/error"
import { authService } from "../services/auth.service"
import { emailSchema } from "../schemas/auth.schemas"
import type { EmailPayload } from "../types/auth.types"

const initialValues: EmailPayload = { email: "" }

export function ChangeEmailForm() {
  const handleSubmit = async (values: EmailPayload, helpers: FormikHelpers<EmailPayload>) => {
    try {
      const { data } = await authService.changeEmail(values)
      toast.success(data.message ?? "Check your new email to verify the change.")
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
          <TextField name="email" label="New email" type="email" placeholder="new@example.com" autoComplete="email" />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Update email"}
          </Button>
        </Form>
      )}
    </Formik>
  )
}
