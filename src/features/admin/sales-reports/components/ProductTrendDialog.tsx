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
import { useReportError } from "../hooks/useReportError";
import type {
  ProductRankingItem,
  ProductTrendResponse,
  SalesReportCommonQuery,
} from "../types/salesReport.types";
import { ChartEmpty, ChartLoading } from "./ChartFeedback";
import { compactNumber, currencyTooltip } from "../utils/chart";

interface ProductTrendDialogProps {
  product: ProductRankingItem | null;
  query: SalesReportCommonQuery;
  onClose: () => void;
}

export function ProductTrendDialog({ product, query, onClose }: ProductTrendDialogProps) {
  const handleError = useReportError();
  const [data, setData] = useState<ProductTrendResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!product) return;
    const productId = product.productId;
    let mounted = true;
    async function load() {
      setIsLoading(true);
      setData(null);
      try {
        const res = await salesReportService.productTrend(productId, query);
        if (mounted) setData(res.data.data);
      } catch (error) {
        if (mounted) handleError(error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [product, query, handleError]);

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product?.productName ?? "Product trend"}</DialogTitle>
          <DialogDescription>
            {product?.categoryName} · {product?.sku}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <ChartLoading message="Loading product trend..." />
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
