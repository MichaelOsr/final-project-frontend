const numberFormatter = new Intl.NumberFormat("en-US");

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatNumber(value: number | undefined) {
  return numberFormatter.format(value ?? 0);
}

export function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Not available" : dateFormatter.format(date);
}

export function getInitials(name?: string) {
  return (name ?? "A")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
