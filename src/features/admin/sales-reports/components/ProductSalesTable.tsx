import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AdminDataTable,
  type SortOrder,
} from "@/features/admin/shared/components/AdminDataTable";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import { formatPrice } from "@/lib/format";
import { formatNumber } from "@/features/admin/shared/utils/adminFormat";
import type {
  ProductRankingItem,
  ProductSortBy,
} from "../types/salesReport.types";

interface ProductSalesTableProps {
  items: ProductRankingItem[];
  isLoading: boolean;
  meta: PaginationMeta;
  sortBy: ProductSortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: string, sortOrder: SortOrder) => void;
  onPageChange: (page: number) => void;
  onSelect: (item: ProductRankingItem) => void;
}

export function ProductSalesTable({
  items,
  isLoading,
  meta,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onSelect,
}: ProductSalesTableProps) {
  const columns = useMemo<ColumnDef<ProductRankingItem>[]>(
    () => [
      {
        id: "productName",
        accessorKey: "productName",
        header: "Product",
        cell: ({ row }) => (
          <button
            type="button"
            className="text-left font-medium hover:text-primary hover:underline"
            onClick={() => onSelect(row.original)}
          >
            {row.original.productName}
            <span className="block text-xs text-muted-foreground">
              {row.original.sku}
            </span>
          </button>
        ),
      },
      {
        id: "category",
        accessorKey: "categoryName",
        header: "Category",
        enableSorting: false,
      },
      {
        id: "totalItemsSold",
        accessorKey: "totalItemsSold",
        header: "Items Sold",
        cell: ({ row }) => formatNumber(row.original.totalItemsSold),
      },
      {
        id: "productSales",
        accessorKey: "productSales",
        header: "Product Sales",
        cell: ({ row }) => formatPrice(row.original.productSales),
      },
    ],
    [onSelect],
  );

  return (
    <AdminDataTable
      columns={columns}
      data={items}
      isLoading={isLoading}
      skeletonRows={meta.limit}
      emptyMessage="No products for the selected filters."
      minWidth="min-w-[640px]"
      pagination={{ meta, onPageChange }}
      sorting={{ sortBy, sortOrder, onSortChange }}
    />
  );
}
