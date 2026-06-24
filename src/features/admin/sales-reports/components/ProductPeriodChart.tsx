import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { salesReportService } from "../services/salesReport.service";
import { useReportError } from "../hooks/useReportError";
import type { ProductSalesQuery, ProductSeries } from "../types/salesReport.types";
import { AccessDenied, ChartEmpty, ChartLoading } from "./ChartFeedback";
import { StackedSalesChart } from "./StackedSalesChart";
import { GranularityToggle } from "./GranularityToggle";
import { categoryColor } from "../utils/chart";

type ChartRow = Record<string, string | number>;

const OTHERS_COLOR = "#94a3b8";

export function ProductPeriodChart({
  query,
  isActive,
}: {
  query: ProductSalesQuery;
  isActive: boolean;
}) {
  const handleError = useReportError();
  const [chart, setChart] = useState<ChartRow[]>([]);
  const [series, setSeries] = useState<ProductSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    let mounted = true;
    async function load() {
      setIsLoading(true);
      setForbidden(false);
      try {
        const res = await salesReportService.products(query);
        if (!mounted) return;
        setChart(res.data.data.chart);
        setSeries(res.data.data.series);
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

  // Backend already ranks top-N and folds the rest into an "Others" series.
  const chartSeries = useMemo(
    () =>
      series.map((s, i) => ({
        key: s.key,
        name: s.productName,
        color: s.isOthers ? OTHERS_COLOR : categoryColor(i),
      })),
    [series],
  );

  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">Product Sales by Period</h2>
          <GranularityToggle />
        </div>
        {forbidden ? (
          <AccessDenied />
        ) : isLoading ? (
          <ChartLoading />
        ) : chartSeries.length === 0 ? (
          <ChartEmpty message="No product sales for the selected filters. Try narrowing by category or search." />
        ) : (
          <StackedSalesChart data={chart} series={chartSeries} />
        )}
      </CardContent>
    </Card>
  );
}
