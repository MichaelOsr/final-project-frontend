import { Formik, Form, type FormikHelpers } from "formik"
import { toast } from "sonner"
import { TextField } from "@/components/form/TextField"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/error"
import { authService } from "../services/auth.service"
import { emailSchema } from "../schemas/auth.schemas"
import type { EmailPayload } from "../types/auth.types"
import { useAuthStore } from "@/store/auth.store"

const initialValues: EmailPayload = { email: "" }

export function ChangeEmailForm({ onDone }: { onDone?: () => void } = {}) {
  const fetchMe = useAuthStore((s) => s.fetchMe)

  const handleSubmit = async (values: EmailPayload, helpers: FormikHelpers<EmailPayload>) => {
    try {
      const { data } = await authService.changeEmail(values)
      toast.success(data.message ?? "Check your new email to verify the change.")
      await fetchMe()        // ← isVerified kini false → ProtectedRoute lempar ke home
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
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update email"}
            </Button>
            {onDone && (
              <Button type="button" variant="ghost" onClick={onDone}>
                Cancel
              </Button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  )
}
