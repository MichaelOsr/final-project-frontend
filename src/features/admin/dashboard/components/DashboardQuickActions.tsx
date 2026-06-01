import { Link } from "react-router-dom";
import { PlusIcon, UserCogIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardQuickActions() {
  return (
    <Card size="sm" className="rounded-lg">
      <CardHeader className="border-b border-border">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-3">
        <Button asChild variant="outline" className="justify-start">
          <Link to="/admin/stores/new">
            <PlusIcon className="size-4" />
            Create Store
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start">
          <Link to="/admin/admin-accounts/new">
            <UserCogIcon className="size-4" />
            Create Admin Account
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start">
          <Link to="/admin/users">
            <UsersIcon className="size-4" />
            View Users
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
