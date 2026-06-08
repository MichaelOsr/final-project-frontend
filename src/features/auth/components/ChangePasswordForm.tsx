import { Formik, Form, type FormikHelpers } from "formik"
import { toast } from "sonner"
import { TextField } from "@/components/form/TextField"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/error"
import { authService } from "../services/auth.service"
import { changePasswordSchema } from "../schemas/auth.schemas"
import type { ChangePasswordPayload } from "../types/auth.types"

const initialValues: ChangePasswordPayload = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
}

export function ChangePasswordForm({ onDone }: { onDone?: () => void } = {}) {
  const handleSubmit = async (
    values: ChangePasswordPayload,
    helpers: FormikHelpers<ChangePasswordPayload>
  ) => {
    try {
      const { data } = await authService.changePassword(values)
      toast.success(data.message ?? "Password updated")
      helpers.resetForm()
      onDone?.()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <Formik initialValues={initialValues} validationSchema={changePasswordSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="grid gap-4">
          <TextField name="oldPassword" label="Current password" type="password" autoComplete="current-password" />
          <TextField name="newPassword" label="New password" type="password" autoComplete="new-password" />
          <TextField name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" />
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Change password"}
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
