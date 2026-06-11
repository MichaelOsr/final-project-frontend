import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebouncedSearchParam } from "../hooks/useDebouncedSearchParam";

export function CatalogSearchField() {
  const [search, setSearch] = useDebouncedSearchParam("q");

  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">Search</Label>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-9 pl-9"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
