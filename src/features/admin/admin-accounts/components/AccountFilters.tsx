import type { ReactNode } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StoreOption } from "@/features/admin/shared/types/admin.types";
import type { AdminRoleOption } from "@/features/admin/shared/types/admin.types";
import { formatRoleName } from "@/features/admin/shared/utils/adminFormat";

export type AccountSortBy = "createdAt" | "roleName" | "storeName";

interface AccountFiltersProps {
  query: string;
  roleName: string;
  roles: AdminRoleOption[];
  sortBy: AccountSortBy;
  storeName: string;
  stores: StoreOption[];
  onChangePage: (page: number) => void;
  onChangeQuery: (value: string) => void;
  onChangeRoleName: (value: string) => void;
  onChangeSortBy: (value: AccountSortBy) => void;
  onChangeStoreName: (value: string) => void;
}

export function AccountFilters(props: AccountFiltersProps) {
  const updateFilter = (setter: (value: string) => void, value: string) => {
    props.onChangePage(1);
    setter(value);
  };

  return (
    <div className="grid items-end gap-3 border-b border-border p-4 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_12rem_12rem_10rem]">
      <FilterSearch value={props.query} onChange={(value) => updateFilter(props.onChangeQuery, value)} />
      <FilterSelect label="Role" value={props.roleName} onChange={(value) => updateFilter(props.onChangeRoleName, value)}>
        <option value="">All roles</option>
        {props.roles.map((role) => <option key={role.id} value={role.name}>{formatRoleName(role.name)}</option>)}
      </FilterSelect>
      <FilterSelect label="Store" value={props.storeName} onChange={(value) => updateFilter(props.onChangeStoreName, value)}>
        <option value="">All stores</option>
        {props.stores.map((store) => <option key={store.id} value={store.name}>{store.name}</option>)}
      </FilterSelect>
      <FilterSelect label="Sort by" value={props.sortBy} onChange={(value) => { props.onChangePage(1); props.onChangeSortBy(value as AccountSortBy); }}>
        <option value="createdAt">Created</option>
        <option value="roleName">Role name</option>
        <option value="storeName">Store name</option>
      </FilterSelect>
    </div>
  );
}

function FilterSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-1.5 sm:col-span-2 xl:col-span-1">
      <Label className="text-xs text-muted-foreground">Search</Label>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-9 pl-9" placeholder="Search name or email" value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}

function FilterSelect({ children, label, value, onChange }: { children: ReactNode; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </div>
  );
}
