import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminUserOverview } from "@/features/admin/shared/types/admin.types";
import { formatDate, formatRoleName } from "@/features/admin/shared/utils/adminFormat";

interface AccountsTableProps {
  isLoading: boolean;
  accounts: AdminUserOverview[];
  onDelete: (account: AdminUserOverview) => void;
  onEdit: (account: AdminUserOverview) => void;
  onView: (account: AdminUserOverview) => void;
}

export function AccountsTable({ accounts, isLoading, onDelete, onEdit, onView }: AccountsTableProps) {
  if (isLoading) {
    return <div className="px-4 py-10 text-center text-sm text-muted-foreground">Loading accounts...</div>;
  }

  if (accounts.length === 0) {
    return <div className="px-4 py-10 text-center text-sm text-muted-foreground">No accounts found.</div>;
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
          {accounts.map((account) => <AccountRow key={account.id} account={account} onDelete={onDelete} onEdit={onEdit} onView={onView} />)}
        </tbody>
      </table>
    </div>
  );
}

function AccountRow({ account, onDelete, onEdit, onView }: {
  account: AdminUserOverview;
  onDelete: (account: AdminUserOverview) => void;
  onEdit: (account: AdminUserOverview) => void;
  onView: (account: AdminUserOverview) => void;
}) {
  const isUserAccount = account.role?.name === "user";

  return (
    <tr>
      <td className="px-4 py-3 font-medium">{account.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{account.email}</td>
      <td className="px-4 py-3 text-muted-foreground">{formatRoleName(account.role?.name)}</td>
      <td className="px-4 py-3 text-muted-foreground">{account.store?.name ?? "-"}</td>
      <td className="px-4 py-3"><VerificationBadge isVerified={account.isVerified} /></td>
      <td className="px-4 py-3 text-muted-foreground">{formatDate(account.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex justify-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => onView(account)} aria-label="View account"><EyeIcon className="size-4" /></Button>
          {!isUserAccount ? (
            <>
              <Button variant="ghost" size="icon-sm" onClick={() => onEdit(account)} aria-label="Edit account"><PencilIcon className="size-4" /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => onDelete(account)} aria-label="Delete account"><Trash2Icon className="size-4 text-destructive" /></Button>
            </>
          ) : null}
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
