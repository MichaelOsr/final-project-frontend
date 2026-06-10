import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StoreFiltersProps {
  query: string;
  onChangePage: (page: number) => void;
  onChangeQuery: (value: string) => void;
}

export function StoreFilters(props: StoreFiltersProps) {
  return (
    <div className="border-b border-border p-4">
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Search</Label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-9 pl-9" placeholder="Search store name" value={props.query} onChange={(event) => props.onChangeQuery(event.target.value)} />
        </div>
      </div>
    </div>
  );
}
