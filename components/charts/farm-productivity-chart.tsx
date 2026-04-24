"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCurrency } from "@/contexts/currency-context";
import { formatCompact } from "@/lib/currency";

export interface FarmProductivityData {
  farmName: string;
  totalHectares: number;
  yieldPerHectare: number;
  revenuePerHectare: number;
  totalYieldKg: number;
  totalRevenue: number;
}

interface FarmProductivityChartProps {
  data: FarmProductivityData[];
  metric?: "yield" | "revenue" | "both";
}

const formatNumber = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toFixed(0);
};

export function FarmProductivityChart({
  data,
  metric = "both",
}: FarmProductivityChartProps) {
  const { formatAmount, currency, symbol } = useCurrency();

  if (metric === "both") {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="farmName"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis
            yAxisId="left"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={formatNumber}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => formatCompact(value, currency)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value, name) => {
              const n = Number(value ?? 0);
              if (name === "Yield/Hectare")
                return [`${n.toFixed(0)} kg/ha`, name];
              if (name === "Revenue/Hectare")
                return [`${formatAmount(n)}/ha`, name];
              return [value, name];
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="yieldPerHectare"
            fill="#22c55e"
            name="Yield/Hectare"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenuePerHectare"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Revenue/Hectare"
            dot={{ fill: "#3b82f6" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  const dataKey = metric === "yield" ? "yieldPerHectare" : "revenuePerHectare";
  const color = metric === "yield" ? "#22c55e" : "#3b82f6";
  const label =
    metric === "yield" ? "Yield per Hectare (kg)" : `Revenue per Hectare (${symbol})`;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="farmName"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={formatNumber}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value) => {
            const n = Number(value ?? 0);
            return [
              metric === "yield"
                ? `${n.toFixed(0)} kg/ha`
                : `${formatAmount(n)}/ha`,
              label,
            ];
          }}
        />
        <Legend />
        <Bar
          dataKey={dataKey}
          fill={color}
          name={label}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
