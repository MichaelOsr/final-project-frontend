import type { AdminStore, StoreFormValues, StorePayload } from "../types/adminStore.types";

export const emptyStoreValues: StoreFormValues = { name: "", latitude: "", longitude: "" };

export function toStoreFormValues(store: AdminStore): StoreFormValues {
  return {
    name: store.name,
    latitude: store.latitude ?? "",
    longitude: store.longitude ?? "",
  };
}

export function toStorePayload(values: StoreFormValues): StorePayload {
  return {
    name: values.name.trim(),
    latitude: parseOptionalNumber(values.latitude),
    longitude: parseOptionalNumber(values.longitude),
  };
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
}
