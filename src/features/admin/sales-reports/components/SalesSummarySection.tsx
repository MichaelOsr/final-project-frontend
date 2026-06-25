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
import { useLatestRequest } from "@/features/admin/shared/hooks/useLatestRequest";
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

interface SalesSummarySectionProps {
  query: SalesReportCommonQuery;
  // When provided, the parent shows a single page-level AccessDenied instead
  // of this section rendering its own (avoids two redundant "denied" panels
  // when the tab below hits the same permission check).
  onForbidden?: () => void;
}

// Always-visible summary cards + main sales chart, shown above the report
// tabs (Transactions / Categories / Products) per the API docs layout.
export function SalesSummarySection({ query, onForbidden }: SalesSummarySectionProps) {
  const handleError = useReportError();
  const { start, isCurrent } = useLatestRequest();
  const [summary, setSummary] = useState<SalesTrendSummary | null>(null);
  const [chart, setChart] = useState<SalesTrendPoint[]>([]);
  const [range, setRange] = useState<ResolvedRange | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const requestId = start();
    async function load() {
      setIsLoading(true);
      setForbidden(false);
      try {
        const res = await salesReportService.trend(query);
        if (!isCurrent(requestId)) return;
        setSummary(res.data.data.summary);
        setChart(res.data.data.chart);
        setRange(res.data.data.filters.resolvedRange);
      } catch (error) {
        if (!isCurrent(requestId)) return;
        if (handleError(error) === "forbidden") {
          setForbidden(true);
          onForbidden?.();
        }
      } finally {
        if (isCurrent(requestId)) setIsLoading(false);
      }
    }
    load();
  }, [query, handleError, start, isCurrent, onForbidden]);

  if (forbidden) return onForbidden ? null : <AccessDenied />;

  return (
    <div className="space-y-4">
      <RangeCaption range={range} />
      <SalesSummaryCards metrics={buildMetrics(summary, isLoading)} />
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

const PLACEHOLDER = "—";

function buildMetrics(summary: SalesTrendSummary | null, isLoading: boolean) {
  const money = (value: number | undefined) =>
    isLoading ? PLACEHOLDER : formatPrice(value ?? 0);
  const count = (value: number | undefined) =>
    isLoading ? PLACEHOLDER : formatNumber(value);

  return [
    { label: "Total Revenue", value: money(summary?.totalRevenue), icon: WalletIcon },
    { label: "Product Sales", value: money(summary?.productSales), icon: CoinsIcon },
    { label: "Total Orders", value: count(summary?.totalOrders), icon: ShoppingCartIcon },
    { label: "Items Sold", value: count(summary?.totalItemsSold), icon: BoxesIcon },
    { label: "Voucher Discount", value: money(summary?.transactionVoucherDiscount), icon: TicketIcon },
    { label: "Delivery Revenue", value: money(summary?.deliveryRevenue), icon: TruckIcon },
    { label: "Average Order Value", value: money(summary?.averageOrderValue), icon: ReceiptIcon },
  ];
}
