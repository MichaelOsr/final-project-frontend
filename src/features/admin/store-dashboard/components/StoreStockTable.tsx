import { Edit2Icon, EyeIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/features/admin/shared/utils/adminFormat";
import type { PaginationMeta } from "@/features/admin/shared/types/admin.types";
import type { StoreStock } from "../types/storeDashboard.types";

interface StoreStockTableProps {
  stocks: StoreStock[];
  isLoading: boolean;
  meta: PaginationMeta;
  page: number;
  onView: (slug: string) => void;
  onPageChange: (page: number) => void;
}

function stockBadgeClass(stock: number) {
  if (stock === 0) return "bg-red-100 text-red-700";
  if (stock < 10) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

function StockRow({ stock, onView }: { stock: StoreStock; onView: (slug: string) => void }) {
  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {stock.product.images[0] && (
            <img src={stock.product.images[0].image} alt={stock.product.name} className="size-10 rounded-lg object-cover" />
          )}
          <p className="min-w-0 truncate font-medium">{stock.product.name}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{stock.product.category.name}</td>
      <td className="px-4 py-3 font-mono text-xs">{stock.product.sku}</td>
      <td className="px-4 py-3">Rp {stock.product.price.toLocaleString("id-ID")}</td>
      <td className="px-4 py-3 text-center">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockBadgeClass(stock.stock)}`}>{stock.stock}</span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(stock.updatedAt)}</td>
      <td className="flex items-center justify-center gap-2 px-4 py-3 text-center">
        <Button variant="ghost" size="sm" onClick={() => onView(stock.product.slug)} title="View product">
          <EyeIcon className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => toast.info("To be implemented")} title="Edit stock">
          <Edit2Icon className="size-4" />
        </Button>
      </td>
    </tr>
  );
}

function StatusRow({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={7} className="px-4 py-3 text-center text-muted-foreground">{message}</td>
    </tr>
  );
}

function Pagination({ page, meta, count, onPageChange }: { page: number; meta: PaginationMeta; count: number; onPageChange: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
      <p className="text-muted-foreground">Showing {count} of {meta.total} products</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
        <span className="flex items-center px-2 text-xs text-muted-foreground">Page {page} of {meta.totalPages}</span>
        <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

export function StoreStockTable({ stocks, isLoading, meta, page, onView, onPageChange }: StoreStockTableProps) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Product</th>
              <th className="px-4 py-3 text-left font-semibold">Category</th>
              <th className="px-4 py-3 text-left font-semibold">SKU</th>
              <th className="px-4 py-3 text-left font-semibold">Price</th>
              <th className="px-4 py-3 text-center font-semibold">Stock</th>
              <th className="px-4 py-3 text-left font-semibold">Updated</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <StatusRow message="Loading..." />}
            {!isLoading && stocks.length === 0 && <StatusRow message="No products found" />}
            {!isLoading && stocks.map((stock) => <StockRow key={stock.id} stock={stock} onView={onView} />)}
          </tbody>
        </table>
      </div>
      {!isLoading && stocks.length > 0 && <Pagination page={page} meta={meta} count={stocks.length} onPageChange={onPageChange} />}
    </>
  );
}
