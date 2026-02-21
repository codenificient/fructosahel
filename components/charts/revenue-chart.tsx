"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useCurrency } from "@/contexts/currency-context";
import { formatCompact } from "@/lib/currency";

export interface RevenueChartData {
  month: string;
  revenue: number;
  expenses: number;
}

interface RevenueChartProps {
  data: RevenueChartData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { formatAmount, currency } = useCurrency();

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
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
          formatter={(value: number) => formatAmount(value)}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: "#22c55e" }}
          activeDot={{ r: 8 }}
          name="Revenue"
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: "#ef4444" }}
          activeDot={{ r: 8 }}
          name="Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
