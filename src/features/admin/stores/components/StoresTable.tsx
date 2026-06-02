import { Link } from "react-router-dom";
import { EyeIcon, LayoutDashboardIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import type { AdminStore } from "../types/adminStore.types";

interface StoresTableProps {
  isLoading: boolean;
  stores: AdminStore[];
  onDelete: () => void;
  onEdit: () => void;
  onView: (store: AdminStore) => void;
}

export function StoresTable({ isLoading, stores, onDelete, onEdit, onView }: StoresTableProps) {
  if (isLoading) {
    return <div className="px-4 py-10 text-center text-sm text-muted-foreground">Loading stores...</div>;
  }

  if (stores.length === 0) {
    return <div className="px-4 py-10 text-center text-sm text-muted-foreground">No stores found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Store</th>
            <th className="px-4 py-2 font-medium">Latitude</th>
            <th className="px-4 py-2 font-medium">Longitude</th>
            <th className="px-4 py-2 font-medium">Updated</th>
            <th className="px-4 py-2 text-center font-medium">Dashboard</th>
            <th className="px-4 py-2 text-center font-medium">Manage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {stores.map((store) => (
            <StoreRow key={store.id} store={store} onDelete={onDelete} onEdit={onEdit} onView={onView} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StoreRow({
  store,
  onDelete,
  onEdit,
  onView,
}: {
  store: AdminStore;
  onDelete: () => void;
  onEdit: () => void;
  onView: (store: AdminStore) => void;
}) {
  return (
    <tr>
      <td className="px-4 py-3 font-medium">{store.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{store.latitude ?? "-"}</td>
      <td className="px-4 py-3 text-muted-foreground">{store.longitude ?? "-"}</td>
      <td className="px-4 py-3 text-muted-foreground">{formatDate(store.updatedAt)}</td>
      <td className="px-4 py-3">
        <div className="flex justify-center gap-1">
          <Button asChild variant="ghost" size="icon-sm" aria-label="Open store dashboard">
            <Link to={`/admin/store/dashboard?storeId=${store.id}`}><LayoutDashboardIcon className="size-4" /></Link>
          </Button>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => onView(store)} aria-label="View store"><EyeIcon className="size-4" /></Button>
          <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Edit store">
            <PencilIcon className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label="Delete store">
            <Trash2Icon className="size-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
