import { useField } from "formik"
import type { ComponentProps } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface TextFieldProps extends ComponentProps<"input"> {
  name: string
  label: string
}

// Formik-aware input: wires value/onChange/onBlur via useField and shows the
// validation message once the field has been touched. Reusable across features.
export function TextField({ name, label, ...props }: TextFieldProps) {
  const [field, meta] = useField(name)
  const error = meta.touched ? meta.error : undefined
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} {...field} {...props} aria-invalid={Boolean(error)} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
