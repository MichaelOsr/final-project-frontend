import { Formik, Form, type FormikHelpers } from "formik";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/button";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { adminLoginSchema } from "../schemas/adminAuth.schemas";
import { adminAuthService } from "../services/adminAuth.service";
import type { AdminLoginPayload } from "../types/adminAuth.types";
import { getAdminErrorMessage } from "../utils/adminError";
import { getAdminLandingPath } from "../utils/adminRouting";

const initialValues: AdminLoginPayload = { email: "", password: "" };

export function AdminLoginForm() {
  const navigate = useNavigate();
  const setSession = useAdminSessionStore((state) => state.setSession);
  const fetchMe = useAdminSessionStore((state) => state.fetchMe);

  const handleSubmit = async (
    values: AdminLoginPayload,
    helpers: FormikHelpers<AdminLoginPayload>
  ) => {
    try {
      const loginResponse = await adminAuthService.login(values);
      const loginUser = loginResponse.data.data ?? (await fetchMe());

      if (!loginUser) {
        throw new Error("Admin login response is missing user data");
      }

      setSession(loginUser);
      navigate(getAdminLandingPath(loginUser), { replace: true });
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
          <TextField
            name="email"
            label="Email"
            type="email"
            placeholder="admin@example.com"
            autoComplete="email"
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
          />
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
