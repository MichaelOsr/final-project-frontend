import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { salesReportService } from "../services/salesReport.service";
import { useReportError } from "@/features/admin/shared/hooks/useReportError";
import type {
  CategorySeries,
  CategoryShare,
  ResolvedRange,
  SalesReportCommonQuery,
} from "../types/salesReport.types";
import { AccessDenied, ChartEmpty, ChartLoading } from "@/features/admin/shared/components/ChartFeedback";
import { categoryColor, currencyTooltip } from "../utils/chart";
import { StackedSalesChart } from "./StackedSalesChart";
import { GranularityToggle } from "./GranularityToggle";
import { RangeCaption } from "@/features/admin/shared/components/RangeCaption";

type CategoryChartRow = Record<string, string | number>;

export function CategorySalesTab({
  query,
  isActive,
}: {
  query: SalesReportCommonQuery;
  isActive: boolean;
}) {
  const handleError = useReportError();
  const [chart, setChart] = useState<CategoryChartRow[]>([]);
  const [series, setSeries] = useState<CategorySeries[]>([]);
  const [share, setShare] = useState<CategoryShare[]>([]);
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
        const res = await salesReportService.categories(query);
        if (!mounted) return;
        setChart(res.data.data.chart);
        setSeries(res.data.data.series);
        setShare(res.data.data.share);
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

  // One stable colour per category so the bar and pie agree visually.
  const colorById = useMemo(
    () => new Map(series.map((s, i) => [s.categoryId, categoryColor(i)])),
    [series],
  );
  const chartSeries = useMemo(
    () =>
      series.map((s) => ({
        key: s.key,
        name: s.categoryName,
        color: colorById.get(s.categoryId) ?? categoryColor(0),
      })),
    [series, colorById],
  );

  if (forbidden) return <AccessDenied />;
  if (isLoading) return <ChartLoading />;
  if (share.length === 0) return <ChartEmpty />;

  return (
    <div className="space-y-3">
      <RangeCaption range={range} />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-lg xl:col-span-2">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">Sales by Category</h2>
              <GranularityToggle />
            </div>
            <StackedSalesChart data={chart} series={chartSeries} />
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="p-4">
            <h2 className="mb-4 text-sm font-medium">Category Share</h2>
            <CategoryShareChart share={share} colorById={colorById} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CategoryShareChart({
  share,
  colorById,
}: {
  share: CategoryShare[];
  colorById: Map<string, string>;
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={share}
          dataKey="productSales"
          nameKey="categoryName"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={2}
        >
          {share.map((category, index) => (
            <Cell
              key={category.categoryId}
              fill={colorById.get(category.categoryId) ?? categoryColor(index)}
            />
          ))}
        </Pie>
        <Tooltip formatter={currencyTooltip} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
