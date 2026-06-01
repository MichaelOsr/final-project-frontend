import { Formik, Form, useField, type FormikHelpers } from "formik";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { adminAuthApi } from "../api/adminAuth.api";
import { adminLoginSchema } from "../schemas/adminAuth.schemas";
import type { AdminLoginPayload } from "../types/adminAuth.types";
import { getAdminErrorMessage } from "../utils/adminError";

const initialValues: AdminLoginPayload = { email: "", password: "" };

function AdminEmailField() {
  const [field, meta] = useField("email");
  const emailRef = useRef<HTMLInputElement>(null);
  const error = meta.touched ? meta.error : undefined;

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  return (
    <div className="grid gap-1.5">
      <Label htmlFor="admin-email">Email</Label>
      <Input
        id="admin-email"
        ref={emailRef}
        type="email"
        placeholder="admin@example.com"
        autoComplete="email"
        aria-invalid={Boolean(error)}
        {...field}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function AdminPasswordField() {
  const [field, meta] = useField("password");
  const error = meta.touched ? meta.error : undefined;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor="admin-password">Password</Label>
      <Input
        id="admin-password"
        type="password"
        autoComplete="current-password"
        aria-invalid={Boolean(error)}
        {...field}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function AdminLoginForm() {
  const navigate = useNavigate();
  const setSession = useAdminSessionStore((state) => state.setSession);

  const handleSubmit = async (
    values: AdminLoginPayload,
    helpers: FormikHelpers<AdminLoginPayload>,
  ) => {
    try {
      const loginResponse = await adminAuthApi.login(values);
      const loginUser = loginResponse.data.data;

      if (!loginUser) {
        throw new Error("Admin login response is missing user data");
      }

      setSession(loginUser);
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={adminLoginSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="grid gap-4">
          <AdminEmailField />
          <AdminPasswordField />
          <Button
            type="submit"
            className="h-12 w-full rounded-full text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Continue"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
