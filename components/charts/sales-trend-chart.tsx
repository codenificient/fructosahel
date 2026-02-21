"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useCurrency } from "@/contexts/currency-context";
import { formatCompact } from "@/lib/currency";

export interface SalesTrendData {
  date: string;
  [key: string]: string | number;
}

interface SalesTrendChartProps {
  data: SalesTrendData[];
  crops: string[];
}

const CROP_COLORS: { [key: string]: string } = {
  Mango: "#f59e0b",
  Cashew: "#10b981",
  Pineapple: "#3b82f6",
  Banana: "#8b5cf6",
  Papaya: "#ec4899",
  Orange: "#f97316",
  Tomato: "#ef4444",
  Onion: "#14b8a6",
};

export function SalesTrendChart({ data, crops }: SalesTrendChartProps) {
  const { formatAmount, currency } = useCurrency();

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          {crops.map((crop) => (
            <linearGradient
              key={crop}
              id={`color${crop}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={CROP_COLORS[crop] || "#6b7280"}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={CROP_COLORS[crop] || "#6b7280"}
                stopOpacity={0.1}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
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
        {crops.map((crop) => (
          <Area
            key={crop}
            type="monotone"
            dataKey={crop}
            stackId="1"
            stroke={CROP_COLORS[crop] || "#6b7280"}
            fill={`url(#color${crop})`}
            name={crop}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
