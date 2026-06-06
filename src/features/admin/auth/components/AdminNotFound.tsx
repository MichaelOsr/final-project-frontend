import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdminSessionStore } from "@/store/adminSession.store";
import { getAdminLandingPath } from "../utils/adminRouting";

export function AdminNotFound() {
  const user = useAdminSessionStore((state) => state.user);
  const fallbackPath = user ? getAdminLandingPath(user) : "/admin/login";

  return (
    <div className="grid min-h-svh place-items-center px-4 py-20 text-center">
      <div className="grid gap-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">This admin page could not be found.</p>
        <div>
          <Button asChild>
            <Link to={fallbackPath}>Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
