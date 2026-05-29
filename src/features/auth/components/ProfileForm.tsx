import { useState, type ChangeEvent } from "react"
import { Formik, Form, type FormikHelpers } from "formik"
import { toast } from "sonner"
import { TextField } from "@/components/form/TextField"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/auth.store"
import { getErrorMessage } from "@/lib/error"
import { authService } from "../services/auth.service"
import { updateProfileSchema } from "../schemas/auth.schemas"

const MAX_SIZE = 1024 * 1024 // 1MB (per PRD)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"]

// Client-side avatar validation mirroring the PRD rules (jpg/jpeg/png/gif, ≤1MB).
function validateAvatar(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Only JPG, PNG, or GIF images are allowed"
  if (file.size > MAX_SIZE) return "Image must be 1MB or smaller"
  return null
}

export function ProfileForm() {
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    const error = file ? validateAvatar(file) : null
    setAvatarError(error)
    setAvatarFile(error ? null : file)
    setPreview(file && !error ? URL.createObjectURL(file) : null)
  }

  const handleSubmit = async (values: { name: string }, helpers: FormikHelpers<{ name: string }>) => {
    if (avatarError) return helpers.setSubmitting(false)
    try {
      const formData = new FormData()
      formData.append("name", values.name)
      if (avatarFile) formData.append("avatar", avatarFile)
      await authService.updateProfile(formData)
      await fetchMe()
      toast.success("Profile updated")
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <Formik
      enableReinitialize
      initialValues={{ name: user?.name ?? "" }}
      validationSchema={updateProfileSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="grid gap-4">
          <div className="grid gap-2">
            <Label>Profile photo</Label>
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarImage src={preview ?? user?.avatar ?? undefined} alt={user?.name} />
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleAvatarChange}
                className="text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm"
              />
            </div>
            {avatarError ? <p className="text-xs text-destructive">{avatarError}</p> : null}
          </div>
          <TextField name="name" label="Full name" autoComplete="name" />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </Form>
      )}
    </Formik>
  )
}
