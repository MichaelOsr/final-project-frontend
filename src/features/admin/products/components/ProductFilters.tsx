import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductCategory } from "../types/adminProduct.types";

interface ProductFiltersProps {
  categoryId: string;
  categories: ProductCategory[];
  query: string;
  onChangeCategory: (value: string) => void;
  onChangePage: (page: number) => void;
  onChangeQuery: (value: string) => void;
}

export function ProductFilters(props: ProductFiltersProps) {
  return (
    <div className="grid gap-3 border-b border-border p-4 md:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Search</Label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-9 pl-9" placeholder="Search products" value={props.query} onChange={(event) => {
            props.onChangePage(1);
            props.onChangeQuery(event.target.value);
          }} />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">Category</Label>
        <select
          className="border-input bg-background h-9 rounded-md border px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={props.categoryId}
          onChange={(event) => props.onChangeCategory(event.target.value)}
        >
          <option value="">All categories</option>
          {props.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </div>
    </div>
  );
}
