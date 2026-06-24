import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactNumber, currencyTooltip } from "../utils/chart";

export interface ChartSeries {
  key: string; // chart row key (an id)
  name: string; // human-readable label for legend/tooltip
  color: string;
}

interface StackedSalesChartProps {
  data: Record<string, string | number>[];
  series: ChartSeries[];
  height?: number;
}

// Period-bucketed stacked bar chart shared by the category and product reports.
export function StackedSalesChart({ data, series, height = 320 }: StackedSalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={compactNumber} width={56} />
        <Tooltip formatter={currencyTooltip} />
        <Legend />
        {series.map(({ key, name, color }) => (
          <Bar key={key} dataKey={key} name={name} stackId="sales" fill={color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
