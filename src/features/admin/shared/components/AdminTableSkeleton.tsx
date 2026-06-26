import { TableCell, TableRow } from "@/components/ui/table";

// Shimmer placeholder rows shown while a table's data is loading.
export function AdminTableSkeletonRows({ rows, columnCount }: { rows: number; columnCount: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-${rowIndex}`}>
          {Array.from({ length: columnCount }).map((_, cellIndex) => (
            <TableCell key={cellIndex} className="px-4 py-3">
              <div className="h-4 w-full max-w-35 animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
