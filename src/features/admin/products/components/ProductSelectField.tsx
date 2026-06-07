import { useField } from "formik";
import type { ComponentProps, ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ProductSelectFieldProps extends ComponentProps<"select"> {
  name: string;
  label: string;
  children: ReactNode;
}

export function ProductSelectField({ name, label, children, className, ...props }: ProductSelectFieldProps) {
  const [field, meta] = useField(name);
  const error = meta.touched ? meta.error : undefined;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        {...field}
        {...props}
        aria-invalid={Boolean(error)}
        className={cn(
          "border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          className,
        )}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
