import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const CATALOG_PATH = "/products-catalog";
const INPUT_CLASS =
  "h-10 w-full rounded-full border border-input bg-muted/50 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20";

export function SearchBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const active = pathname.startsWith(CATALOG_PATH) && isDesktop;
  const qParam = searchParams.get("q") ?? "";

  const [value, setValue] = useState(qParam);
  const debounced = useDebouncedValue(value, 400);
  const committed = useRef(qParam);
  const wasActive = useRef(active);

  useEffect(() => {
    const becameActive = active && !wasActive.current;
    wasActive.current = active;
    if (!active) return;

    // Just switched onto the catalog (e.g. clicked the inactive search bar
    // from another page): hard-sync from the URL and drop any stale typed
    // value left over from a previous visit instead of re-committing it.
    if (becameActive) {
      committed.current = qParam;
      if (value !== qParam) setValue(qParam);
      return;
    }

    // External `q` change (e.g. "Clear all"): mirror it into the input.
    if (qParam !== committed.current) {
      committed.current = qParam;
      setValue(qParam);
      return;
    }

    // Local typing settled: commit it to the URL.
    if (debounced !== committed.current) {
      committed.current = debounced;
      const next = new URLSearchParams(searchParams);
      if (debounced) next.set("q", debounced);
      else next.delete("q");
      next.set("page", "1");
      setSearchParams(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam, debounced, active]);

  return (
    <div className="relative hidden flex-1 items-center md:flex">
      <SearchIcon className="absolute left-3.5 size-4 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search products and stores"
        className={INPUT_CLASS}
        value={active ? value : ""}
        readOnly={!active}
        onChange={(e) => setValue(e.target.value)}
        onClick={() => {
          if (!active) navigate(CATALOG_PATH);
        }}
      />
    </div>
  );
}

export function MobileSearchButton() {
  const navigate = useNavigate();
  return (
    <button
      className="ml-auto rounded-full p-2 text-foreground transition-colors hover:bg-muted md:hidden"
      aria-label="Search"
      onClick={() => navigate(CATALOG_PATH)}
    >
      <SearchIcon className="size-5" />
    </button>
  );
}
