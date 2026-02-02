"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface CropPerformanceData {
  cropType: string;
  expectedYield: number;
  actualYield: number;
  yieldEfficiency: number;
}

interface CropPerformanceChartProps {
  data: CropPerformanceData[];
}

const COLORS = {
  pineapple: "#f59e0b",
  cashew: "#8b5cf6",
  avocado: "#10b981",
  mango: "#f97316",
  banana: "#eab308",
  papaya: "#ec4899",
};

const getCropColor = (cropType: string): string => {
  return COLORS[cropType as keyof typeof COLORS] || "#6b7280";
};

const formatYield = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}t`;
  }
  return `${value}kg`;
};

export function CropPerformanceChart({ data }: CropPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          type="number"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={formatYield}
        />
        <YAxis
          type="category"
          dataKey="cropType"
          className="text-xs capitalize"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          width={70}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: number, name: string) => [
            `${value.toLocaleString()} kg`,
            name === "expectedYield" ? "Expected" : "Actual",
          ]}
        />
        <Legend />
        <Bar
          dataKey="expectedYield"
          name="Expected Yield"
          fill="#94a3b8"
          radius={[0, 4, 4, 0]}
        />
        <Bar dataKey="actualYield" name="Actual Yield" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell
              key={`cell-${entry.cropType}`}
              fill={getCropColor(entry.cropType)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
