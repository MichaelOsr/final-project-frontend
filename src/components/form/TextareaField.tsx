import { useField } from "formik"
import type { ComponentProps } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface TextareaFieldProps extends ComponentProps<"textarea"> {
  name: string
  label: string
}

export function TextareaField({ name, label, ...props }: TextareaFieldProps) {
  const [field, meta] = useField(name)
  const error = meta.touched ? meta.error : undefined
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} {...field} {...props} aria-invalid={Boolean(error)} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
