import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { updateSearchParams } from "../utils/searchParams";

export function useDebouncedSearchParam(key: string, delayMs = 400) {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramValue = searchParams.get(key) ?? "";
  const [input, setInput] = useState(paramValue);
  const debounced = useDebouncedValue(input, delayMs);
  const committed = useRef(paramValue);

  useEffect(() => {
    if (paramValue !== committed.current) {
      committed.current = paramValue;
      setInput(paramValue);
    }
  }, [paramValue]);

  useEffect(() => {
    if (debounced !== committed.current) {
      committed.current = debounced;
      setSearchParams((prev) =>
        updateSearchParams(prev, { [key]: debounced, page: 1 })
      );
    }
  }, [debounced, key, setSearchParams]);

  return [input, setInput] as const;
}
