"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCurrency } from "@/contexts/currency-context";
import { formatCompact } from "@/lib/currency";

export interface FinancialSummaryData {
  period: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}

interface FinancialSummaryChartProps {
  data: FinancialSummaryData[];
  showNetProfit?: boolean;
}

export function FinancialSummaryChart({
  data,
  showNetProfit = true,
}: FinancialSummaryChartProps) {
  const { formatAmount, currency } = useCurrency();

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="period"
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
        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
        <Bar
          dataKey="revenue"
          fill="#22c55e"
          name="Revenue"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          fill="#ef4444"
          name="Expenses"
          radius={[4, 4, 0, 0]}
        />
        {showNetProfit && (
          <Bar
            dataKey="netProfit"
            fill="#3b82f6"
            name="Net Profit"
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
