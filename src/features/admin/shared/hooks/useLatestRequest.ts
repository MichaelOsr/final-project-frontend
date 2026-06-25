import { useCallback, useRef } from "react";

// Guards async fetch effects against out-of-order responses: if filters
// change again before a slower, earlier request resolves, that stale
// response must not overwrite newer state. A plain "mounted" flag only
// protects against unmount, not against an older request resolving after
// a newer one started.
//
// start/isCurrent are wrapped in useCallback with empty deps so their
// identity is stable across re-renders. Callers put them in effect
// dependency arrays; if they were recreated every render (plain function
// declarations), every state update from the effect would re-trigger the
// same effect, causing an infinite fetch loop.
export function useLatestRequest() {
  const requestIdRef = useRef(0);

  const start = useCallback(() => ++requestIdRef.current, []);
  const isCurrent = useCallback((requestId: number) => requestId === requestIdRef.current, []);

  return { start, isCurrent };
}
