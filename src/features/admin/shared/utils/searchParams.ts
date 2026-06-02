export function getPageParam(params: URLSearchParams) {
  const page = Number(params.get("page") ?? "1");
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function updateSearchParams(
  params: URLSearchParams,
  updates: Record<string, string | number>,
) {
  const nextParams = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    const nextValue = String(value);
    if (nextValue) nextParams.set(key, nextValue);
    else nextParams.delete(key);
  });
  return nextParams;
}
