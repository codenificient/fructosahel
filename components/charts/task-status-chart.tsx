"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";

export interface TaskStatusData {
  status: string;
  count: number;
}

interface TaskStatusChartProps {
  data: TaskStatusData[];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "#f59e0b"; // amber
    case "in_progress":
      return "#3b82f6"; // blue
    case "completed":
      return "#22c55e"; // green
    case "cancelled":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};

export function TaskStatusChart({ data }: TaskStatusChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          type="number"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          type="category"
          dataKey="status"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`${value} tasks`, "Count"]}
        />
        <Legend />
        <Bar dataKey="count" name="Tasks" radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
