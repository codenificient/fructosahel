"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileBarChart,
  Filter,
  ListTodo,
  MapPin,
  Printer,
  Sprout,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { CropPerformanceChart } from "@/components/charts/crop-performance-chart";
import { FarmProductivityChart } from "@/components/charts/farm-productivity-chart";
import { FinancialSummaryChart } from "@/components/charts/financial-summary-chart";
import { TaskCompletionChart } from "@/components/charts/task-completion-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFarms } from "@/lib/hooks/use-farms";
import {
  type PeriodType,
  type ReportFilters,
  useReports,
} from "@/lib/hooks/use-reports";

const CROP_TYPES = [
  { value: "all", label: "All Crops" },
  { value: "pineapple", label: "Pineapple" },
  { value: "cashew", label: "Cashew" },
  { value: "avocado", label: "Avocado" },
  { value: "mango", label: "Mango" },
  { value: "banana", label: "Banana" },
  { value: "papaya", label: "Papaya" },
];

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

export default function ReportsPage() {
  const t = useTranslations();
  const printRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [filters, setFilters] = useState<ReportFilters>({
    period: "monthly",
    startDate: getDefaultStartDate("monthly"),
    endDate: new Date().toISOString().split("T")[0],
  });

  // Fetch data
  const { data: farmsData } = useFarms();
  const { data: reportsData, isLoading, error, refetch } = useReports(filters);

  // Update filters
  const updateFilter = (key: keyof ReportFilters, value: string) => {
    if (key === "farmId" && value === "all") {
      const newFilters = { ...filters };
      delete newFilters.farmId;
      setFilters(newFilters);
    } else if (key === "cropType" && value === "all") {
      const newFilters = { ...filters };
      delete newFilters.cropType;
      setFilters(newFilters);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Period change handler
  const handlePeriodChange = (period: PeriodType) => {
    setFilters((prev) => ({
      ...prev,
      period,
      startDate: getDefaultStartDate(period),
    }));
  };

  // Export to CSV
  const exportToCSV = (reportType: string) => {
    if (!reportsData) return;

    let csvContent = "";
    let filename = "";

    switch (reportType) {
      case "financial":
        csvContent = generateFinancialCSV(reportsData.financial.summary);
        filename = `financial-report-${filters.startDate}-${filters.endDate}.csv`;
        break;
      case "crop":
        csvContent = generateCropCSV(reportsData.crop.performance);
        filename = `crop-report-${filters.startDate}-${filters.endDate}.csv`;
        break;
      case "task":
        csvContent = generateTaskCSV(reportsData.task);
        filename = `task-report-${filters.startDate}-${filters.endDate}.csv`;
        break;
      case "productivity":
        csvContent = generateProductivityCSV(reportsData.productivity.farms);
        filename = `productivity-report-${filters.startDate}-${filters.endDate}.csv`;
        break;
      default:
        return;
    }

    downloadCSV(csvContent, filename);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount);
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {["card-1", "card-2", "card-3", "card-4"].map((id) => (
            <Card key={id}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Reports</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { financial, crop, task, productivity } = reportsData || {
    financial: {
      summary: [],
      totals: { revenue: 0, expenses: 0, netProfit: 0 },
    },
    crop: {
      performance: [],
      totals: {
        totalCrops: 0,
        totalExpectedYield: 0,
        totalActualYield: 0,
        overallEfficiency: 0,
      },
    },
    task: {
      statusDistribution: {},
      overdueCount: 0,
      completionRate: 0,
      byPriority: {},
      averageCompletionTime: null,
    },
    productivity: {
      farms: [],
      totals: {
        totalHectares: 0,
        totalYield: 0,
        totalRevenue: 0,
        avgYieldPerHectare: 0,
      },
    },
  };

  return (
    <div className="space-y-6 print:p-4" ref={printRef}>
      {/* Header */}
      <div className="flex flex-col gap-4 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileBarChart className="h-8 w-8" />
              {t("reports.title")}
            </h1>
            <p className="text-muted-foreground">{t("reports.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Filters:</Label>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">Period</Label>
                <Select
                  value={filters.period || "monthly"}
                  onValueChange={(value) =>
                    handlePeriodChange(value as PeriodType)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">Farm</Label>
                <Select
                  value={filters.farmId || "all"}
                  onValueChange={(value) => updateFilter("farmId", value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Farms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Farms</SelectItem>
                    {farmsData?.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">
                  Crop Type
                </Label>
                <Select
                  value={filters.cropType || "all"}
                  onValueChange={(value) => updateFilter("cropType", value)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CROP_TYPES.map((crop) => (
                      <SelectItem key={crop.value} value={crop.value}>
                        {crop.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Start Date
                  </Label>
                  <Input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) => updateFilter("startDate", e.target.value)}
                    className="w-40"
                  />
                </div>
                <span className="mt-6 text-muted-foreground">to</span>
                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground">
                    End Date
                  </Label>
                  <Input
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) => updateFilter("endDate", e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Header */}
      <div className="hidden print:block print:mb-8">
        <h1 className="text-2xl font-bold">FructoSahel Reports</h1>
        <p className="text-sm text-muted-foreground">
          Period: {filters.startDate} to {filters.endDate}
        </p>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="print:hidden">
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
        <TabsContent value="financial" className="space-y-4 print:block">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-xl font-semibold">Financial Summary Report</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV("financial")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Summary Cards */}
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
                  {formatCurrency(financial.totals.revenue)} XOF
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
                  {formatCurrency(financial.totals.expenses)} XOF
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
                  {formatCurrency(financial.totals.netProfit)} XOF
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses by Period</CardTitle>
              <CardDescription>
                {filters.period === "monthly"
                  ? "Monthly"
                  : filters.period === "quarterly"
                    ? "Quarterly"
                    : "Yearly"}{" "}
                breakdown of financial performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {financial.summary.length > 0 ? (
                <FinancialSummaryChart data={financial.summary} />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                  No financial data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Revenue (XOF)</TableHead>
                    <TableHead className="text-right">Expenses (XOF)</TableHead>
                    <TableHead className="text-right">
                      Net Profit (XOF)
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
                        {formatCurrency(row.revenue)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(row.expenses)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          row.netProfit >= 0 ? "text-blue-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(row.netProfit)}
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
        <TabsContent value="crop" className="space-y-4 print:block">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-xl font-semibold">Crop Performance Report</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV("crop")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Summary Cards */}
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
                  {formatCurrency(crop.totals.totalExpectedYield)} kg
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
                  {formatCurrency(crop.totals.totalActualYield)} kg
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

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Yield Analysis by Crop Type</CardTitle>
              <CardDescription>
                Comparison of expected vs actual yield across crop types
              </CardDescription>
            </CardHeader>
            <CardContent>
              {crop.performance.length > 0 ? (
                <CropPerformanceChart data={crop.performance} />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                  No crop data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table */}
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
                        {formatCurrency(row.totalPlants)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.expectedYield)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.actualYield)}
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
        <TabsContent value="task" className="space-y-4 print:block">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-xl font-semibold">Task Completion Report</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV("task")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Summary Cards */}
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

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Status</CardTitle>
                <CardDescription>
                  Distribution of tasks across different statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(task.statusDistribution).length > 0 ? (
                  <TaskCompletionChart
                    data={Object.entries(task.statusDistribution).map(
                      ([status, count]) => ({
                        status,
                        count,
                      }),
                    )}
                  />
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No task data available
                  </div>
                )}
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
                      data.total > 0 ? (data.completed / data.total) * 100 : 0;
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

          {/* Table */}
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
                      const percentage = total > 0 ? (count / total) * 100 : 0;
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
        <TabsContent value="productivity" className="space-y-4 print:block">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-xl font-semibold">Farm Productivity Report</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV("productivity")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Summary Cards */}
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
                  {formatCurrency(productivity.totals.totalYield)} kg
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
                  {formatCurrency(productivity.totals.avgYieldPerHectare)} kg/ha
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
                  {formatCurrency(productivity.totals.totalRevenue)} XOF
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Farm Comparison</CardTitle>
              <CardDescription>
                Yield and revenue per hectare across farms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productivity.farms.length > 0 ? (
                <FarmProductivityChart data={productivity.farms} />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                  No productivity data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table */}
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
                    <TableHead className="text-right">Fields</TableHead>
                    <TableHead className="text-right">Crops</TableHead>
                    <TableHead className="text-right">Yield (kg)</TableHead>
                    <TableHead className="text-right">Yield/ha</TableHead>
                    <TableHead className="text-right">Revenue (XOF)</TableHead>
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
                        {farm.totalFields}
                      </TableCell>
                      <TableCell className="text-right">
                        {farm.totalCrops}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(farm.totalYieldKg)}
                      </TableCell>
                      <TableCell className="text-right">
                        {farm.yieldPerHectare.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(farm.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(farm.revenuePerHectare)}
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

// Helper functions for CSV export
function getDefaultStartDate(period: PeriodType): string {
  const now = new Date();
  switch (period) {
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth() - 11, 1)
        .toISOString()
        .split("T")[0];
    case "quarterly":
      return new Date(now.getFullYear() - 2, now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
    case "yearly":
      return new Date(now.getFullYear() - 4, 0, 1).toISOString().split("T")[0];
    default:
      return new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
  }
}

interface FinancialCSVRow {
  period: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  salesCount: number;
  transactionCount: number;
}

function generateFinancialCSV(data: FinancialCSVRow[]): string {
  const headers = [
    "Period",
    "Revenue (XOF)",
    "Expenses (XOF)",
    "Net Profit (XOF)",
    "Sales Count",
    "Transaction Count",
  ];
  const rows = data.map((row) => [
    row.period,
    row.revenue,
    row.expenses,
    row.netProfit,
    row.salesCount,
    row.transactionCount,
  ]);
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

interface CropCSVRow {
  cropType: string;
  totalPlants: number;
  expectedYield: number;
  actualYield: number;
  yieldEfficiency: number;
}

function generateCropCSV(data: CropCSVRow[]): string {
  const headers = [
    "Crop Type",
    "Total Plants",
    "Expected Yield (kg)",
    "Actual Yield (kg)",
    "Efficiency (%)",
  ];
  const rows = data.map((row) => [
    row.cropType,
    row.totalPlants,
    row.expectedYield,
    row.actualYield,
    row.yieldEfficiency.toFixed(1),
  ]);
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

interface TaskCSVData {
  statusDistribution: Record<string, number>;
  completionRate: number;
  overdueCount: number;
  averageCompletionTime: number | null;
}

function generateTaskCSV(data: TaskCSVData): string {
  const headers = ["Status", "Count"];
  const rows = Object.entries(data.statusDistribution).map(
    ([status, count]) => [status, count],
  );
  const summary = [
    "",
    ["Completion Rate", `${data.completionRate.toFixed(1)}%`],
    ["Overdue Tasks", data.overdueCount],
    [
      "Avg Completion Time",
      data.averageCompletionTime
        ? `${data.averageCompletionTime.toFixed(1)} days`
        : "N/A",
    ],
  ];
  return [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
    "",
    "Summary",
    ...summary.filter(Array.isArray).map((row) => row.join(",")),
  ].join("\n");
}

interface ProductivityCSVRow {
  farmName: string;
  totalHectares: number;
  totalFields: number;
  totalCrops: number;
  totalYieldKg: number;
  yieldPerHectare: number;
  totalRevenue: number;
  revenuePerHectare: number;
}

function generateProductivityCSV(data: ProductivityCSVRow[]): string {
  const headers = [
    "Farm",
    "Size (ha)",
    "Fields",
    "Crops",
    "Total Yield (kg)",
    "Yield/ha (kg)",
    "Revenue (XOF)",
    "Revenue/ha (XOF)",
  ];
  const rows = data.map((row) => [
    row.farmName,
    row.totalHectares.toFixed(1),
    row.totalFields,
    row.totalCrops,
    row.totalYieldKg,
    row.yieldPerHectare.toFixed(0),
    row.totalRevenue,
    row.revenuePerHectare.toFixed(0),
  ]);
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
