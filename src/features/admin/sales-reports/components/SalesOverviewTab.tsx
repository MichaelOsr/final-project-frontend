import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BoxesIcon,
  CoinsIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  TicketIcon,
  TruckIcon,
  WalletIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { formatNumber } from "@/features/admin/shared/utils/adminFormat";
import { salesReportService } from "../services/salesReport.service";
import { useReportError } from "@/features/admin/shared/hooks/useReportError";
import type {
  ResolvedRange,
  SalesReportCommonQuery,
  SalesTrendPoint,
  SalesTrendSummary,
} from "../types/salesReport.types";
import { SalesSummaryCards } from "./SalesSummaryCards";
import { GranularityToggle } from "./GranularityToggle";
import { RangeCaption } from "@/features/admin/shared/components/RangeCaption";
import { AccessDenied, ChartEmpty, ChartLoading } from "@/features/admin/shared/components/ChartFeedback";
import { compactNumber, currencyTooltip } from "../utils/chart";

export function SalesOverviewTab({
  query,
  isActive,
}: {
  query: SalesReportCommonQuery;
  isActive: boolean;
}) {
  const handleError = useReportError();
  const [summary, setSummary] = useState<SalesTrendSummary | null>(null);
  const [chart, setChart] = useState<SalesTrendPoint[]>([]);
  const [range, setRange] = useState<ResolvedRange | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    let mounted = true;
    async function load() {
      setIsLoading(true);
      setForbidden(false);
      try {
        const res = await salesReportService.trend(query);
        if (!mounted) return;
        setSummary(res.data.data.summary);
        setChart(res.data.data.chart);
        setRange(res.data.data.filters.resolvedRange);
      } catch (error) {
        if (mounted && handleError(error) === "forbidden") setForbidden(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [isActive, query, handleError]);

  if (forbidden) return <AccessDenied />;

  return (
    <div className="space-y-4">
      <RangeCaption range={range} />
      <SalesSummaryCards metrics={buildMetrics(summary)} />
      <Card className="rounded-lg">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Sales Trend</h2>
            <GranularityToggle />
          </div>
          {isLoading ? (
            <ChartLoading />
          ) : chart.length === 0 ? (
            <ChartEmpty />
          ) : (
            <TrendChart data={chart} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TrendChart({ data }: { data: SalesTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="product" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={compactNumber} width={56} />
        <Tooltip formatter={currencyTooltip} />
        <Legend />
        <Area
          type="monotone"
          dataKey="totalRevenue"
          name="Total Revenue"
          stroke="#6366f1"
          fill="url(#revenue)"
        />
        <Area
          type="monotone"
          dataKey="productSales"
          name="Product Sales"
          stroke="#10b981"
          fill="url(#product)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function buildMetrics(summary: SalesTrendSummary | null) {
  return [
    { label: "Total Revenue", value: formatPrice(summary?.totalRevenue ?? 0), icon: WalletIcon },
    { label: "Product Sales", value: formatPrice(summary?.productSales ?? 0), icon: CoinsIcon },
    { label: "Total Orders", value: formatNumber(summary?.totalOrders), icon: ShoppingCartIcon },
    { label: "Items Sold", value: formatNumber(summary?.totalItemsSold), icon: BoxesIcon },
    { label: "Voucher Discount", value: formatPrice(summary?.transactionVoucherDiscount ?? 0), icon: TicketIcon },
    { label: "Delivery Revenue", value: formatPrice(summary?.deliveryRevenue ?? 0), icon: TruckIcon },
    { label: "Average Order Value", value: formatPrice(summary?.averageOrderValue ?? 0), icon: ReceiptIcon },
  ];
}
