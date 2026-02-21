"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import {
  MapPin,
  Sprout,
  ListTodo,
  DollarSign,
  Users,
  AlertCircle,
  Plus,
  TrendingUp,
  ArrowUpRight,
  Leaf,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RevenueChart,
  CropDistributionChart,
  TaskStatusChart,
  SalesTrendChart,
} from "@/components/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { useFarms } from "@/lib/hooks/use-farms";
import { useCrops } from "@/lib/hooks/use-crops";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useSales } from "@/lib/hooks/use-sales";

const CROP_EMOJI: Record<string, string> = {
  mango: "\uD83E\uDD6D",
  cashew: "\uD83E\uDD5C",
  pineapple: "\uD83C\uDF4D",
  banana: "\uD83C\uDF4C",
  papaya: "\uD83C\uDF48",
  avocado: "\uD83E\uDD51",
};

const STATUS_PROGRESS: Record<string, number> = {
  planning: 5,
  planted: 15,
  growing: 30,
  flowering: 45,
  fruiting: 65,
  harvesting: 85,
  harvested: 100,
  dormant: 0,
};

export default function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();

  const {
    data: farms,
    isLoading: farmsLoading,
    error: farmsError,
    refetch: refetchFarms,
  } = useFarms();
  const {
    data: crops,
    isLoading: cropsLoading,
    error: cropsError,
    refetch: refetchCrops,
  } = useCrops();
  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useTasks();
  const {
    data: txData,
    isLoading: txLoading,
    error: txError,
    refetch: refetchTx,
  } = useTransactions();
  const {
    data: salesData,
    isLoading: salesLoading,
    error: salesError,
    refetch: refetchSales,
  } = useSales();

  const isLoading =
    farmsLoading || cropsLoading || tasksLoading || txLoading || salesLoading;
  const error = farmsError || cropsError || tasksError || txError || salesError;

  const refetchAll = async () => {
    await Promise.all([
      refetchFarms(),
      refetchCrops(),
      refetchTasks(),
      refetchTx(),
      refetchSales(),
    ]);
  };

  // Derived stats
  const stats = useMemo(() => {
    const farmCount = farms?.length ?? 0;
    const totalHectares = (farms ?? []).reduce(
      (sum, f) => sum + parseFloat(f.sizeHectares),
      0,
    );
    const activeCrops = (crops ?? []).filter(
      (c) => c.status !== "harvested" && c.status !== "dormant",
    ).length;
    const pendingTasks = (tasks ?? []).filter(
      (t) => t.status === "pending",
    ).length;

    return [
      {
        title: t("dashboard.stats.totalFarms"),
        value: farmCount.toString(),
        icon: MapPin,
        color: "text-primary",
        bg: "bg-primary/10",
      },
      {
        title: t("dashboard.stats.totalHectares"),
        value: totalHectares.toFixed(1),
        icon: Sprout,
        color: "text-accent",
        bg: "bg-accent/10",
      },
      {
        title: t("dashboard.stats.activeCrops"),
        value: activeCrops.toString(),
        icon: Leaf,
        color: "text-sahel-terracotta",
        bg: "bg-sahel-terracotta/10",
      },
      {
        title: t("dashboard.stats.pendingTasks"),
        value: pendingTasks.toString(),
        icon: ListTodo,
        color: "text-sahel-earth",
        bg: "bg-sahel-earth/10",
      },
    ];
  }, [farms, crops, tasks, t]);

  const financialStats = useMemo(() => {
    const revenue = txData?.totals.income ?? 0;
    const expenses = txData?.totals.expense ?? 0;

    return [
      {
        title: t("dashboard.stats.monthlyRevenue"),
        value: new Intl.NumberFormat("fr-FR").format(revenue),
        icon: TrendingUp,
        color: "text-primary",
      },
      {
        title: t("dashboard.stats.monthlyExpenses"),
        value: new Intl.NumberFormat("fr-FR").format(expenses),
        icon: DollarSign,
        color: "text-sahel-terracotta",
      },
    ];
  }, [txData, t]);

  // Recent tasks (top 5, sorted by due date)
  const recentTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    return [...tasks]
      .filter((t) => t.status !== "completed" && t.status !== "cancelled")
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 5);
  }, [tasks]);

  // Crop status grouped by type
  const cropStatus = useMemo(() => {
    if (!crops || crops.length === 0) return [];
    const grouped: Record<
      string,
      { count: number; statuses: Record<string, number> }
    > = {};

    for (const crop of crops) {
      const type = crop.cropType;
      if (!grouped[type]) {
        grouped[type] = { count: 0, statuses: {} };
      }
      grouped[type].count++;
      grouped[type].statuses[crop.status] =
        (grouped[type].statuses[crop.status] || 0) + 1;
    }

    return Object.entries(grouped)
      .map(([type, data]) => {
        // Find the dominant status
        const dominantStatus = Object.entries(data.statuses).sort(
          ([, a], [, b]) => b - a,
        )[0][0];
        const progress = STATUS_PROGRESS[dominantStatus] ?? 0;

        return {
          crop: type.charAt(0).toUpperCase() + type.slice(1),
          emoji: CROP_EMOJI[type] || "\uD83C\uDF31",
          fields: data.count,
          status: dominantStatus.charAt(0).toUpperCase() + dominantStatus.slice(1),
          progress,
        };
      })
      .sort((a, b) => b.fields - a.fields);
  }, [crops]);

  // Revenue chart data (group transactions by month)
  const revenueData = useMemo(() => {
    const transactions = txData?.transactions ?? [];
    if (transactions.length === 0) return [];

    const monthMap: Record<string, { revenue: number; expenses: number }> = {};
    for (const tx of transactions) {
      const date = new Date(tx.transactionDate);
      const month = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      if (!monthMap[month]) {
        monthMap[month] = { revenue: 0, expenses: 0 };
      }
      const amount = parseFloat(tx.amount);
      if (tx.type === "income") {
        monthMap[month].revenue += amount;
      } else {
        monthMap[month].expenses += amount;
      }
    }

    return Object.entries(monthMap)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
      }))
      .slice(-6);
  }, [txData]);

  // Crop distribution chart data
  const cropDistributionData = useMemo(() => {
    if (!crops || crops.length === 0) return [];
    const countByType: Record<string, number> = {};
    for (const crop of crops) {
      const name = crop.cropType.charAt(0).toUpperCase() + crop.cropType.slice(1);
      countByType[name] = (countByType[name] || 0) + 1;
    }
    return Object.entries(countByType).map(([name, value]) => ({ name, value }));
  }, [crops]);

  // Task status chart data
  const taskStatusData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    const countByStatus: Record<string, number> = {};
    for (const task of tasks) {
      const status =
        task.status === "in_progress"
          ? "In Progress"
          : task.status.charAt(0).toUpperCase() + task.status.slice(1);
      countByStatus[status] = (countByStatus[status] || 0) + 1;
    }
    return Object.entries(countByStatus).map(([status, count]) => ({
      status,
      count,
    }));
  }, [tasks]);

  // Sales trend chart data (group by week and crop type)
  const { salesTrendData, cropTypes } = useMemo(() => {
    const sales = salesData?.sales ?? [];
    if (sales.length === 0) return { salesTrendData: [], cropTypes: [] };

    const cropSet = new Set<string>();
    const weekMap: Record<string, Record<string, number>> = {};

    for (const sale of sales) {
      const date = new Date(sale.saleDate);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekLabel = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const cropName =
        sale.cropType.charAt(0).toUpperCase() + sale.cropType.slice(1);
      cropSet.add(cropName);

      if (!weekMap[weekLabel]) {
        weekMap[weekLabel] = {};
      }
      weekMap[weekLabel][cropName] =
        (weekMap[weekLabel][cropName] || 0) + parseFloat(sale.totalAmount);
    }

    const types = Array.from(cropSet);
    const data = Object.entries(weekMap).map(([date, cropData]) => ({
      date,
      ...cropData,
    }));

    return { salesTrendData: data, cropTypes: types };
  }, [salesData]);

  const formatDueDate = (dueDate: Date | string | null) => {
    if (!dueDate) return "No date";
    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.round(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const hasNoData =
    !isLoading &&
    !error &&
    (farms?.length ?? 0) === 0 &&
    (crops?.length ?? 0) === 0 &&
    (tasks?.length ?? 0) === 0;

  // Error state
  if (error && !isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("dashboard.title")}
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">{t("dashboard.errorTitle")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {error.message || t("common.error")}
            </p>
          </div>
          <Button onClick={refetchAll} variant="outline">
            {t("dashboard.tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  // Empty state (new user with no data)
  if (hasNoData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground">{t("dashboard.welcome")}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-8">
            <Sprout className="h-16 w-16 text-primary" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="font-bold text-xl">{t("dashboard.emptyTitle")}</h3>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              {t("dashboard.emptyDescription")}
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="shadow-sm">
              <Link href={`/${locale}/dashboard/farms`}>
                <Plus className="mr-2 h-4 w-4" />
                {t("farms.addFarm")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/demo`}>{t("dashboard.tryDemo")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("dashboard.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("dashboard.overview")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {financialStats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.color === "text-primary" ? "bg-primary/10" : "bg-sahel-terracotta/10"}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold">{stat.value} XOF</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("dashboard.recentTasks")}</CardTitle>
              <CardDescription>
                {t("dashboard.tasksNeedingAttention")}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${locale}/dashboard/tasks`}>
                {t("common.viewAll")}
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <ListTodo className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.noTasks")}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        {task.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            task.priority === "urgent"
                              ? "destructive"
                              : task.priority === "high"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "success"
                              : task.status === "in_progress"
                                ? "default"
                                : "outline"
                          }
                        >
                          {task.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDueDate(task.dueDate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Crop Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("dashboard.cropOverview")}</CardTitle>
              <CardDescription>
                {t("dashboard.cropStatusDescription")}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${locale}/dashboard/farms/crops`}>
                {t("common.viewAll")}
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : cropStatus.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Sprout className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.noCrops")}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {cropStatus.map((crop) => (
                  <div key={crop.crop} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{crop.emoji}</span>
                        <div>
                          <span className="font-medium">{crop.crop}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({crop.fields} {crop.fields === 1 ? "crop" : "crops"})
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {crop.status}
                      </Badge>
                    </div>
                    <Progress value={crop.progress} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("dashboard.analyticsTitle")}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.analyticsSubtitle")}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.revenueVsExpenses")}</CardTitle>
              <CardDescription>
                {t("dashboard.financialPerformance")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : revenueData.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  {t("dashboard.noTransactions")}
                </div>
              ) : (
                <RevenueChart data={revenueData} />
              )}
            </CardContent>
          </Card>

          {/* Crop Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.cropDistribution")}</CardTitle>
              <CardDescription>
                {t("dashboard.cropDistributionDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : cropDistributionData.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  {t("dashboard.noCropData")}
                </div>
              ) : (
                <CropDistributionChart data={cropDistributionData} />
              )}
            </CardContent>
          </Card>

          {/* Task Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.taskStatus")}</CardTitle>
              <CardDescription>{t("dashboard.taskStatusDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : taskStatusData.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  {t("dashboard.noTaskData")}
                </div>
              ) : (
                <TaskStatusChart data={taskStatusData} />
              )}
            </CardContent>
          </Card>

          {/* Sales Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.salesTrend")}</CardTitle>
              <CardDescription>{t("dashboard.salesTrendDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : salesTrendData.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  {t("dashboard.noSalesData")}
                </div>
              ) : (
                <SalesTrendChart data={salesTrendData} crops={cropTypes} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.quickActions")}</CardTitle>
          <CardDescription>{t("dashboard.quickActionsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-5 hover:bg-primary/5 hover:border-primary/30"
              asChild
            >
              <Link href={`/${locale}/dashboard/farms`}>
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm">{t("farms.addFarm")}</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-5 hover:bg-accent/5 hover:border-accent/30"
              asChild
            >
              <Link href={`/${locale}/dashboard/tasks`}>
                <ListTodo className="h-5 w-5 text-accent" />
                <span className="text-sm">{t("tasks.addTask")}</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-5 hover:bg-sahel-terracotta/5 hover:border-sahel-terracotta/30"
              asChild
            >
              <Link href={`/${locale}/dashboard/finance`}>
                <DollarSign className="h-5 w-5 text-sahel-terracotta" />
                <span className="text-sm">{t("finance.addTransaction")}</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-5 hover:bg-sahel-earth/5 hover:border-sahel-earth/30"
              asChild
            >
              <Link href={`/${locale}/dashboard/agents`}>
                <Users className="h-5 w-5 text-sahel-earth" />
                <span className="text-sm">{t("dashboard.aiAdvisors")}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
