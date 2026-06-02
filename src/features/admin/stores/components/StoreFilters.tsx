import type { ReactNode } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type StoreSortBy = "name" | "createdAt" | "updatedAt";

interface StoreFiltersProps {
  query: string;
  sortBy: StoreSortBy;
  onChangePage: (page: number) => void;
  onChangeQuery: (value: string) => void;
  onChangeSortBy: (value: StoreSortBy) => void;
}

export function StoreFilters(props: StoreFiltersProps) {
  return (
    <div className="grid items-end gap-3 border-b border-border p-4 sm:grid-cols-[minmax(14rem,1fr)_12rem]">
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Search</Label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-9 pl-9" placeholder="Search store name" value={props.query} onChange={(event) => {
            props.onChangePage(1);
            props.onChangeQuery(event.target.value);
          }} />
        </div>
      </div>
      <FilterSelect label="Sort by" value={props.sortBy} onChange={(value) => {
        props.onChangePage(1);
        props.onChangeSortBy(value as StoreSortBy);
      }}>
        <option value="name">Name</option>
        <option value="createdAt">Created</option>
        <option value="updatedAt">Updated</option>
      </FilterSelect>
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
