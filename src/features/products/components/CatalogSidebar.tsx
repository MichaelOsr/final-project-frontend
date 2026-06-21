import { CatalogFilters } from "./CatalogFilters";

export function CatalogSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-card px-4 py-6 md:flex">
      <div>
        <h2 className="text-lg font-bold">Filters</h2>
        <p className="text-sm text-muted-foreground">Refine your search</p>
      </div>
      <CatalogFilters />
    </aside>
  );
}
