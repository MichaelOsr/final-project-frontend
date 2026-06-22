import { endOfDay, format, parseISO, startOfDay } from "date-fns";

// Forms hold local "yyyy-MM-dd'T'HH:mm"; the backend wants an absolute ISO instant.
export function toLocalDateTime(iso: string): string {
  return iso ? format(parseISO(iso), "yyyy-MM-dd'T'HH:mm") : "";
}

export function toIso(local: string): string {
  return local ? new Date(local).toISOString() : local;
}

// Disable a calendar day when it falls before `min` or after `max` (day-level).
export function isOutsideRange(date: Date, min?: string, max?: string): boolean {
  if (min && date < startOfDay(new Date(min))) return true;
  if (max && date > endOfDay(new Date(max))) return true;
  return false;
}
