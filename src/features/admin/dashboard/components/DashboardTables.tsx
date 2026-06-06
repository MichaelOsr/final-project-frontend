import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboardIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminDataTable } from "@/features/admin/shared/components/AdminDataTable";
import type {
  AdminUserOverview,
  StoreOverview,
} from "../types/adminDashboard.types";
import { formatDate } from "@/features/admin/shared/utils/adminFormat";

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

export function StoresTable({ stores }: { stores: StoreOverview[] }) {
  return (
    <TableShell title="Recent Stores">
      <AdminDataTable columns={storeColumns} data={stores} emptyMessage="No stores found." minWidth="min-w-[540px]" />
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
  const columns = getPeopleColumns(showStore);

  return (
    <TableShell title={title}>
      <AdminDataTable columns={columns} data={people} emptyMessage={`No ${title.toLowerCase()} found.`} minWidth="min-w-[620px]" />
    </TableShell>
  );
}

const storeColumns: ColumnDef<StoreOverview>[] = [
  { accessorKey: "name", header: "Store", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: "latitude", header: "Latitude", cell: ({ row }) => <span className="text-muted-foreground">{row.original.latitude ?? "-"}</span> },
  { accessorKey: "longitude", header: "Longitude", cell: ({ row }) => <span className="text-muted-foreground">{row.original.longitude ?? "-"}</span> },
  { id: "created", header: "Created", cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span> },
  { id: "dashboard", header: () => <div className="text-center">Dashboard</div>, cell: ({ row }) => <DashboardAction store={row.original} /> },
];

function getPeopleColumns(showStore: boolean): ColumnDef<AdminUserOverview>[] {
  const columns: ColumnDef<AdminUserOverview>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "email", header: "Email", cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span> },
    { id: "role", header: "Role", cell: ({ row }) => <span className="text-muted-foreground">{row.original.role?.name ?? "-"}</span> },
  ];

  if (showStore) {
    columns.push({ id: "store", header: "Store", cell: ({ row }) => <span className="text-muted-foreground">{row.original.store?.name ?? "-"}</span> });
  }

  columns.push({ id: "verified", header: "Verified", cell: ({ row }) => <VerificationBadge isVerified={row.original.isVerified} /> });
  return columns;
}

function DashboardAction({ store }: { store: StoreOverview }) {
  return (
    <div className="flex justify-center">
      <Button asChild variant="ghost" size="icon-sm" aria-label="Open store dashboard">
        <Link to={`/admin/store/dashboard?storeId=${store.id}`}>
          <LayoutDashboardIcon className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
