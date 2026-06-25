import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { salesReportService } from "../services/salesReport.service";
import { useReportError } from "@/features/admin/shared/hooks/useReportError";
import { useLatestRequest } from "@/features/admin/shared/hooks/useLatestRequest";
import type { CategoryTrendResponse, SalesReportCommonQuery } from "../types/salesReport.types";
import { ChartEmpty, ChartLoading } from "@/features/admin/shared/components/ChartFeedback";
import { compactNumber, currencyTooltip } from "../utils/chart";

interface CategoryTrendDialogProps {
  category: { categoryId: string; categoryName: string } | null;
  query: SalesReportCommonQuery;
  onClose: () => void;
}

export function CategoryTrendDialog({ category, query, onClose }: CategoryTrendDialogProps) {
  const handleError = useReportError();
  const { start, isCurrent } = useLatestRequest();
  const [data, setData] = useState<CategoryTrendResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!category) return;
    const categoryId = category.categoryId;
    const requestId = start();
    async function load() {
      setIsLoading(true);
      setData(null);
      try {
        const res = await salesReportService.categoryTrend(categoryId, query);
        if (isCurrent(requestId)) setData(res.data.data);
      } catch (error) {
        if (isCurrent(requestId)) handleError(error);
      } finally {
        if (isCurrent(requestId)) setIsLoading(false);
      }
    }
    load();
  }, [category, query, handleError, start, isCurrent]);

  return (
    <Dialog open={Boolean(category)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{category?.categoryName ?? "Category trend"}</DialogTitle>
          <DialogDescription>Sales trend for this category over time.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <ChartLoading message="Loading category trend..." />
        ) : !data || data.chart.length === 0 ? (
          <ChartEmpty />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.chart} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={compactNumber} width={56} />
              <Tooltip formatter={currencyTooltip} />
              <Legend />
              <Line
                type="monotone"
                dataKey="productSales"
                name="Product Sales"
                stroke="#6366f1"
              />
              <Line
                type="monotone"
                dataKey="totalItemsSold"
                name="Items Sold"
                stroke="#10b981"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}
