import { useField } from "formik"
import { useState, type ComponentProps } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { EyeOffIcon, EyeIcon } from "lucide-react"


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

export function PasswordTextField({ name, label, ...props }: TextFieldProps) {
  const [field, meta] = useField(name)
  const [show, setShow] = useState(false)
  const error = meta.touched ? meta.error : undefined
  
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <InputGroup>
        <InputGroupInput
          id={name} {...field} {...props}
          type={show ? 'text' : 'password'}
          placeholder="Enter password"
        />
        <InputGroupAddon align="inline-end">
        {
          show ? (
            <EyeIcon onClick={() => setShow(!show)}/>
          ) : (
            <EyeOffIcon onClick={() => setShow(!show)}/>
          )
        }
        </InputGroupAddon>
      </InputGroup>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
