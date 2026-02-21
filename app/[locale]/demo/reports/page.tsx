"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileBarChart,
  ListTodo,
  MapPin,
  Printer,
  Sprout,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CropPerformanceChart } from "@/components/charts/crop-performance-chart";
import { FarmProductivityChart } from "@/components/charts/farm-productivity-chart";
import { FinancialSummaryChart } from "@/components/charts/financial-summary-chart";
import { TaskCompletionChart } from "@/components/charts/task-completion-chart";
import {
  demoFarms,
  demoCrops,
  demoTasks,
  demoTransactions,
  demoSales,
} from "@/lib/demo-data";
import { useCurrency } from "@/contexts/currency-context";

export default function DemoReportsPage() {
  const t = useTranslations();
  const { formatAmount, symbol } = useCurrency();

  // Financial report data
  const financial = useMemo(() => {
    const income = demoTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const expenses = demoTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    // Group by month
    const monthMap: Record<
      string,
      { revenue: number; expenses: number; salesCount: number; txCount: number }
    > = {};

    for (const tx of demoTransactions) {
      const date = new Date(tx.transactionDate);
      const period = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!monthMap[period]) {
        monthMap[period] = { revenue: 0, expenses: 0, salesCount: 0, txCount: 0 };
      }
      const amount = parseFloat(tx.amount);
      if (tx.type === "income") {
        monthMap[period].revenue += amount;
      } else {
        monthMap[period].expenses += amount;
      }
      monthMap[period].txCount++;
    }

    // Add sales counts
    for (const sale of demoSales) {
      const date = new Date(sale.saleDate);
      const period = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (monthMap[period]) {
        monthMap[period].salesCount++;
      }
    }

    const summary = Object.entries(monthMap).map(([period, data]) => ({
      period,
      revenue: data.revenue,
      expenses: data.expenses,
      netProfit: data.revenue - data.expenses,
      salesCount: data.salesCount,
      transactionCount: data.txCount,
    }));

    return {
      summary,
      totals: {
        revenue: income,
        expenses,
        netProfit: income - expenses,
      },
    };
  }, []);

  // Crop performance data
  const crop = useMemo(() => {
    const byType: Record<
      string,
      {
        plants: number;
        expectedYield: number;
        actualYield: number;
        statuses: Record<string, number>;
      }
    > = {};

    for (const c of demoCrops) {
      const type = c.cropType;
      if (!byType[type]) {
        byType[type] = { plants: 0, expectedYield: 0, actualYield: 0, statuses: {} };
      }
      byType[type].plants += c.numberOfPlants ?? 0;
      byType[type].expectedYield += parseFloat(c.expectedYieldKg ?? "0");
      byType[type].actualYield += parseFloat(c.actualYieldKg ?? "0");
      byType[type].statuses[c.status] =
        (byType[type].statuses[c.status] || 0) + 1;
    }

    const performance = Object.entries(byType).map(([cropType, data]) => ({
      cropType,
      totalPlants: data.plants,
      expectedYield: data.expectedYield,
      actualYield: data.actualYield,
      yieldEfficiency:
        data.expectedYield > 0
          ? (data.actualYield / data.expectedYield) * 100
          : 0,
      statusDistribution: data.statuses,
    }));

    const totalExpectedYield = performance.reduce(
      (sum, p) => sum + p.expectedYield,
      0,
    );
    const totalActualYield = performance.reduce(
      (sum, p) => sum + p.actualYield,
      0,
    );

    return {
      performance,
      totals: {
        totalCrops: demoCrops.length,
        totalExpectedYield,
        totalActualYield,
        overallEfficiency:
          totalExpectedYield > 0
            ? (totalActualYield / totalExpectedYield) * 100
            : 0,
      },
    };
  }, []);

  // Task report data
  const task = useMemo(() => {
    const statusDistribution: Record<string, number> = {};
    let completedCount = 0;
    let overdueCount = 0;
    const completionTimes: number[] = [];
    const byPriority: Record<string, { total: number; completed: number }> = {};

    for (const t of demoTasks) {
      statusDistribution[t.status] = (statusDistribution[t.status] || 0) + 1;

      if (t.status === "completed") {
        completedCount++;
        if (t.completedAt && t.createdAt) {
          const days =
            (new Date(t.completedAt).getTime() -
              new Date(t.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);
          completionTimes.push(days);
        }
      }

      if (
        t.status !== "completed" &&
        t.status !== "cancelled" &&
        t.dueDate &&
        new Date(t.dueDate) < new Date()
      ) {
        overdueCount++;
      }

      if (!byPriority[t.priority]) {
        byPriority[t.priority] = { total: 0, completed: 0 };
      }
      byPriority[t.priority].total++;
      if (t.status === "completed") {
        byPriority[t.priority].completed++;
      }
    }

    const totalTasks = demoTasks.length;
    const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
    const averageCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : null;

    return {
      statusDistribution,
      overdueCount,
      completionRate,
      byPriority,
      averageCompletionTime,
    };
  }, []);

  // Farm productivity data
  const productivity = useMemo(() => {
    const farmMap: Record<
      string,
      {
        name: string;
        hectares: number;
        fields: number;
        crops: number;
        yield: number;
        revenue: number;
      }
    > = {};

    for (const farm of demoFarms) {
      farmMap[farm.id] = {
        name: farm.name,
        hectares: parseFloat(farm.sizeHectares),
        fields: 0,
        crops: 0,
        yield: 0,
        revenue: 0,
      };
    }

    for (const c of demoCrops) {
      // Map crops to farms via fieldId prefix convention
      const farmId = Object.keys(farmMap)[0]; // simplified for demo
      for (const fId of Object.keys(farmMap)) {
        if (farmMap[fId]) {
          // Distribute crops across farms evenly for demo
        }
      }
    }

    // Count crops per farm using sales data
    for (const sale of demoSales) {
      if (farmMap[sale.farmId]) {
        farmMap[sale.farmId].revenue += parseFloat(sale.totalAmount);
        farmMap[sale.farmId].yield += parseFloat(sale.quantityKg);
        farmMap[sale.farmId].crops++;
      }
    }

    const farms = Object.entries(farmMap).map(([farmId, data]) => ({
      farmId,
      farmName: data.name,
      totalHectares: data.hectares,
      totalFields: 1,
      totalCrops: data.crops || 1,
      totalYieldKg: data.yield,
      yieldPerHectare: data.hectares > 0 ? data.yield / data.hectares : 0,
      totalRevenue: data.revenue,
      revenuePerHectare: data.hectares > 0 ? data.revenue / data.hectares : 0,
    }));

    const totalHectares = farms.reduce((sum, f) => sum + f.totalHectares, 0);
    const totalYield = farms.reduce((sum, f) => sum + f.totalYieldKg, 0);
    const totalRevenue = farms.reduce((sum, f) => sum + f.totalRevenue, 0);

    return {
      farms,
      totals: {
        totalHectares,
        totalYield,
        totalRevenue,
        avgYieldPerHectare: totalHectares > 0 ? totalYield / totalHectares : 0,
      },
    };
  }, []);

  const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const PRIORITY_LABELS: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileBarChart className="h-8 w-8" />
              {t("reports.title")}
            </h1>
            <p className="text-muted-foreground">{t("reports.subtitle")}</p>
          </div>
          <Button variant="outline" disabled>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>

        {/* Demo Banner */}
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            This is a demo page with sample data. Sign in to access real reports
            with export and print functionality.
          </p>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="crop" className="flex items-center gap-2">
            <Sprout className="h-4 w-4" />
            Crop Performance
          </TabsTrigger>
          <TabsTrigger value="task" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Task Completion
          </TabsTrigger>
          <TabsTrigger value="productivity" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Farm Productivity
          </TabsTrigger>
        </TabsList>

        {/* Financial Report */}
        <TabsContent value="financial" className="space-y-4">
          <h2 className="text-xl font-semibold">Financial Summary Report</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(financial.totals.revenue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatAmount(financial.totals.expenses)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Profit
                </CardTitle>
                {financial.totals.netProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    financial.totals.netProfit >= 0
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {formatAmount(financial.totals.netProfit)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses by Period</CardTitle>
              <CardDescription>
                Monthly breakdown of financial performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {financial.summary.length > 0 ? (
                <FinancialSummaryChart data={financial.summary} />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                  No financial data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Revenue ({symbol})</TableHead>
                    <TableHead className="text-right">Expenses ({symbol})</TableHead>
                    <TableHead className="text-right">
                      Net Profit ({symbol})
                    </TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financial.summary.map((row) => (
                    <TableRow key={row.period}>
                      <TableCell className="font-medium">
                        {row.period}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatAmount(row.revenue)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatAmount(row.expenses)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          row.netProfit >= 0 ? "text-blue-600" : "text-red-600"
                        }`}
                      >
                        {formatAmount(row.netProfit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.salesCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.transactionCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crop Performance Report */}
        <TabsContent value="crop" className="space-y-4">
          <h2 className="text-xl font-semibold">Crop Performance Report</h2>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Crops
                </CardTitle>
                <Sprout className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {crop.totals.totalCrops}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Expected Yield
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatAmount(crop.totals.totalExpectedYield)} kg
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Actual Yield
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatAmount(crop.totals.totalActualYield)} kg
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Yield Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {crop.totals.overallEfficiency.toFixed(1)}%
                </div>
                <Progress
                  value={Math.min(crop.totals.overallEfficiency, 100)}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Yield Analysis by Crop Type</CardTitle>
              <CardDescription>
                Comparison of expected vs actual yield across crop types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CropPerformanceChart data={crop.performance} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crop Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crop Type</TableHead>
                    <TableHead className="text-right">Total Plants</TableHead>
                    <TableHead className="text-right">Expected (kg)</TableHead>
                    <TableHead className="text-right">Actual (kg)</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                    <TableHead>Status Distribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crop.performance.map((row) => (
                    <TableRow key={row.cropType}>
                      <TableCell className="font-medium capitalize">
                        {row.cropType}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatAmount(row.totalPlants)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatAmount(row.expectedYield)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatAmount(row.actualYield)}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.yieldEfficiency.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(row.statusDistribution).map(
                            ([status, count]) => (
                              <Badge
                                key={status}
                                variant="outline"
                                className="text-xs"
                              >
                                {status}: {count}
                              </Badge>
                            ),
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Completion Report */}
        <TabsContent value="task" className="space-y-4">
          <h2 className="text-xl font-semibold">Task Completion Report</h2>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {task.completionRate.toFixed(1)}%
                </div>
                <Progress value={task.completionRate} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue Tasks
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {task.overdueCount}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Completion Time
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {task.averageCompletionTime !== null
                    ? `${task.averageCompletionTime.toFixed(1)} days`
                    : "N/A"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tasks
                </CardTitle>
                <ListTodo className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(task.statusDistribution).reduce(
                    (a, b) => a + b,
                    0,
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Status</CardTitle>
                <CardDescription>
                  Distribution of tasks across different statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskCompletionChart
                  data={Object.entries(task.statusDistribution).map(
                    ([status, count]) => ({
                      status,
                      count,
                    }),
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks by Priority</CardTitle>
                <CardDescription>
                  Completion rate by priority level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(task.byPriority).map(([priority, data]) => {
                    const rate =
                      data.total > 0
                        ? (data.completed / data.total) * 100
                        : 0;
                    return (
                      <div key={priority} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {PRIORITY_LABELS[priority] || priority}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {data.completed}/{data.total} ({rate.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={rate} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(task.statusDistribution).map(
                    ([status, count]) => {
                      const total = Object.values(
                        task.statusDistribution,
                      ).reduce((a, b) => a + b, 0);
                      const percentage =
                        total > 0 ? (count / total) * 100 : 0;
                      return (
                        <TableRow key={status}>
                          <TableCell className="font-medium">
                            {STATUS_LABELS[status] || status}
                          </TableCell>
                          <TableCell className="text-right">{count}</TableCell>
                          <TableCell className="text-right">
                            {percentage.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Farm Productivity Report */}
        <TabsContent value="productivity" className="space-y-4">
          <h2 className="text-xl font-semibold">Farm Productivity Report</h2>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Hectares
                </CardTitle>
                <MapPin className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {productivity.totals.totalHectares.toFixed(1)} ha
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Yield
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatAmount(productivity.totals.totalYield)} kg
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Yield/Hectare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatAmount(
                    Math.round(productivity.totals.avgYieldPerHectare),
                  )}{" "}
                  kg/ha
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(productivity.totals.totalRevenue)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Farm Comparison</CardTitle>
              <CardDescription>
                Yield and revenue per hectare across farms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FarmProductivityChart data={productivity.farms} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Farm Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farm</TableHead>
                    <TableHead className="text-right">Size (ha)</TableHead>
                    <TableHead className="text-right">Crops</TableHead>
                    <TableHead className="text-right">Yield (kg)</TableHead>
                    <TableHead className="text-right">Yield/ha</TableHead>
                    <TableHead className="text-right">Revenue ({symbol})</TableHead>
                    <TableHead className="text-right">Revenue/ha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productivity.farms.map((farm) => (
                    <TableRow key={farm.farmId}>
                      <TableCell className="font-medium">
                        {farm.farmName}
                      </TableCell>
                      <TableCell className="text-right">
                        {farm.totalHectares.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        {farm.totalCrops}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatAmount(farm.totalYieldKg)}
                      </TableCell>
                      <TableCell className="text-right">
                        {farm.yieldPerHectare.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatAmount(farm.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatAmount(Math.round(farm.revenuePerHectare))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
