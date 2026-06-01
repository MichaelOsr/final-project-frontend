import { Card, CardContent } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AdminLoginForm } from "../components/AdminLoginForm";

export function AdminLoginPage() {
  usePageTitle("Admin sign in");

  return (
    <Card className="shadow-lg">
      <CardContent className="grid gap-5 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your dashboard
          </p>
        </div>

        <AdminLoginForm />
      </CardContent>
    </Card>
  );
}
