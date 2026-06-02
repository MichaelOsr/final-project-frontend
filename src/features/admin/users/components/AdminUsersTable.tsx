import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminUserOverview } from "@/features/admin/dashboard/types/adminDashboard.types";
import { formatDate } from "@/features/admin/dashboard/utils/dashboardFormat";
import { formatRoleName } from "@/features/admin/admin-accounts/utils/adminAccountFormat";

interface AdminUsersTableProps {
  isLoading: boolean;
  users: AdminUserOverview[];
  onDelete: (user: AdminUserOverview) => void;
  onEdit: (user: AdminUserOverview) => void;
  onView: (user: AdminUserOverview) => void;
}

export function AdminUsersTable({ isLoading, users, onDelete, onEdit, onView }: AdminUsersTableProps) {
  if (isLoading) {
    return <div className="px-4 py-10 text-center text-sm text-muted-foreground">Loading users...</div>;
  }

  if (users.length === 0) {
    return <div className="px-4 py-10 text-center text-sm text-muted-foreground">No users found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Email</th>
            <th className="px-4 py-2 font-medium">Role</th>
            <th className="px-4 py-2 font-medium">Store</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Created</th>
            <th className="px-4 py-2 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => <AdminUserRow key={user.id} user={user} onDelete={onDelete} onEdit={onEdit} onView={onView} />)}
        </tbody>
      </table>
    </div>
  );
}

function AdminUserRow({ user, onDelete, onEdit, onView }: {
  user: AdminUserOverview;
  onDelete: (user: AdminUserOverview) => void;
  onEdit: (user: AdminUserOverview) => void;
  onView: (user: AdminUserOverview) => void;
}) {
  return (
    <tr>
      <td className="px-4 py-3 font-medium">{user.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
      <td className="px-4 py-3 text-muted-foreground">{formatRoleName(user.role?.name)}</td>
      <td className="px-4 py-3 text-muted-foreground">{user.store?.name ?? "-"}</td>
      <td className="px-4 py-3"><VerificationBadge isVerified={user.isVerified} /></td>
      <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex justify-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => onView(user)} aria-label="View user"><EyeIcon className="size-4" /></Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(user)} aria-label="Edit user"><PencilIcon className="size-4" /></Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onDelete(user)} aria-label="Delete user"><Trash2Icon className="size-4 text-destructive" /></Button>
        </div>
      </td>
    </tr>
  );
}

function VerificationBadge({ isVerified }: { isVerified: boolean }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", isVerified ? "bg-accent text-primary" : "bg-muted text-muted-foreground")}>
      {isVerified ? "Verified" : "Pending"}
    </span>
  );
}
