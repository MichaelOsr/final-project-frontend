import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { useLatestRequest } from "@/features/admin/shared/hooks/useLatestRequest";
import type {
  CategorySeries,
  CategoryShare,
  ResolvedRange,
  SalesReportCommonQuery,
  SalesReportGranularity,
} from "../types/salesReport.types";
import { AccessDenied, ChartEmpty, ChartLoading } from "@/features/admin/shared/components/ChartFeedback";
import { categoryColor, currencyTooltip } from "../utils/chart";
import { StackedSalesChart, type ChartSeries } from "./StackedSalesChart";
import { GranularityToggle } from "./GranularityToggle";
import { RangeCaption } from "@/features/admin/shared/components/RangeCaption";
import { CategoryShareList } from "./CategoryShareList";
import { CategoryTrendDialog } from "./CategoryTrendDialog";

type CategoryChartRow = Record<string, string | number>;

export function CategorySalesTab({
  query,
  isActive,
}: {
  query: SalesReportCommonQuery;
  isActive: boolean;
}) {
  const handleError = useReportError();
  const { start, isCurrent } = useLatestRequest();
  const [searchParams] = useSearchParams();
  const categoryGranularity = (searchParams.get("categoryGranularity") ??
    "monthly") as SalesReportGranularity;
  // This chart buckets by its own granularity, independent of the other charts.
  const categoryQuery = useMemo<SalesReportCommonQuery>(
    () => ({ ...query, granularity: categoryGranularity }),
    [query, categoryGranularity],
  );
  const [chart, setChart] = useState<CategoryChartRow[]>([]);
  const [series, setSeries] = useState<CategorySeries[]>([]);
  const [share, setShare] = useState<CategoryShare[]>([]);
  const [range, setRange] = useState<ResolvedRange | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [selected, setSelected] = useState<CategoryShare | null>(null);

  useEffect(() => {
    if (!isActive) return;
    const requestId = start();
    async function load() {
      setIsLoading(true);
      setForbidden(false);
      try {
        const res = await salesReportService.categories(categoryQuery);
        if (!isCurrent(requestId)) return;
        setChart(res.data.data.chart);
        setSeries(res.data.data.series);
        setShare(res.data.data.share);
        setRange(res.data.data.filters.resolvedRange);
      } catch (error) {
        if (!isCurrent(requestId)) return;
        if (handleError(error) === "forbidden") setForbidden(true);
      } finally {
        if (isCurrent(requestId)) setIsLoading(false);
      }
    }
    load();
  }, [isActive, categoryQuery, handleError, start, isCurrent]);

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

  return (
    <div className="space-y-3">
      <RangeCaption range={range} />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-lg xl:col-span-2">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">Sales by Category</h2>
              <GranularityToggle param="categoryGranularity" />
            </div>
            <CategoryChartBody
              forbidden={forbidden}
              isLoading={isLoading}
              chart={chart}
              chartSeries={chartSeries}
            />
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="p-4">
            <h2 className="mb-1 text-sm font-medium">Category Share</h2>
            <CategoryShareBody
              forbidden={forbidden}
              isLoading={isLoading}
              share={share}
              colorById={colorById}
              onSelect={setSelected}
            />
          </CardContent>
        </Card>
      </div>
      <CategoryTrendDialog
        category={selected}
        query={categoryQuery}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function CategoryChartBody({
  forbidden,
  isLoading,
  chart,
  chartSeries,
}: {
  forbidden: boolean;
  isLoading: boolean;
  chart: CategoryChartRow[];
  chartSeries: ChartSeries[];
}) {
  if (forbidden) return <AccessDenied />;
  if (isLoading) return <ChartLoading />;
  if (chart.length === 0) return <ChartEmpty />;
  return <StackedSalesChart data={chart} series={chartSeries} />;
}

function CategoryShareBody({
  forbidden,
  isLoading,
  share,
  colorById,
  onSelect,
}: {
  forbidden: boolean;
  isLoading: boolean;
  share: CategoryShare[];
  colorById: Map<string, string>;
  onSelect: (category: CategoryShare) => void;
}) {
  if (forbidden) return <AccessDenied />;
  if (isLoading) return <ChartLoading />;
  if (share.length === 0) return <ChartEmpty />;
  return (
    <>
      <CategoryShareChart share={share} colorById={colorById} />
      <p className="mb-2 mt-3 text-xs text-muted-foreground">
        Click a category to view its sales trend.
      </p>
      <CategoryShareList share={share} colorById={colorById} onSelect={onSelect} />
    </>
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
