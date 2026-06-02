import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboardIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  AdminUserOverview,
  StoreOverview,
} from "../types/adminDashboard.types";
import { formatDate } from "../utils/dashboardFormat";

function TableShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card size="sm" className="rounded-lg">
      <CardHeader className="border-b border-border">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">{children}</CardContent>
    </Card>
  );
}

function EmptyRows({ label }: { label: string }) {
  return (
    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
      No {label} found.
    </div>
  );
}

export function StoresTable({ stores }: { stores: StoreOverview[] }) {
  if (stores.length === 0) {
    return <TableShell title="Recent Stores"><EmptyRows label="stores" /></TableShell>;
  }

  return (
    <TableShell title="Recent Stores">
      <table className="w-full min-w-[540px] text-left text-sm">
        <thead className="bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Store</th>
            <th className="px-4 py-2 font-medium">Latitude</th>
            <th className="px-4 py-2 font-medium">Longitude</th>
            <th className="px-4 py-2 font-medium">Created</th>
            <th className="px-4 py-2 text-center font-medium">Dashboard</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {stores.map((store) => (
            <tr key={store.id}>
              <td className="px-4 py-3 font-medium">{store.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{store.latitude ?? "-"}</td>
              <td className="px-4 py-3 text-muted-foreground">{store.longitude ?? "-"}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(store.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <Button asChild variant="ghost" size="icon-sm" aria-label="Open store dashboard">
                    <Link to={`/admin/store/dashboard?storeId=${store.id}`}>
                      <LayoutDashboardIcon className="size-4" />
                    </Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function VerificationBadge({ isVerified }: { isVerified: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isVerified ? "bg-accent text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      {isVerified ? "Verified" : "Pending"}
    </span>
  );
}

export function PeopleTable({
  title,
  people,
  showStore = false,
}: {
  title: string;
  people: AdminUserOverview[];
  showStore?: boolean;
}) {
  if (people.length === 0) {
    return <TableShell title={title}><EmptyRows label={title.toLowerCase()} /></TableShell>;
  }

  return (
    <TableShell title={title}>
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Email</th>
            <th className="px-4 py-2 font-medium">Role</th>
            {showStore ? <th className="px-4 py-2 font-medium">Store</th> : null}
            <th className="px-4 py-2 font-medium">Verified</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {people.map((person) => (
            <tr key={person.id}>
              <td className="px-4 py-3 font-medium">{person.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{person.email}</td>
              <td className="px-4 py-3 text-muted-foreground">{person.role?.name ?? "-"}</td>
              {showStore ? <td className="px-4 py-3 text-muted-foreground">{person.store?.name ?? "-"}</td> : null}
              <td className="px-4 py-3"><VerificationBadge isVerified={person.isVerified} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}
