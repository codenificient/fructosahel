"use client";

import { useTranslations } from "next-intl";
import {
  MapPin,
  Sprout,
  ListTodo,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
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

export default function DashboardPage() {
  const t = useTranslations();

  // Mock data - in production this would come from the database
  const stats = [
    {
      title: t("dashboard.stats.totalFarms"),
      value: "12",
      change: "+2",
      trend: "up",
      icon: MapPin,
    },
    {
      title: t("dashboard.stats.totalHectares"),
      value: "450",
      change: "+25",
      trend: "up",
      icon: Sprout,
    },
    {
      title: t("dashboard.stats.activeCrops"),
      value: "34",
      change: "+8",
      trend: "up",
      icon: Sprout,
    },
    {
      title: t("dashboard.stats.pendingTasks"),
      value: "18",
      change: "-5",
      trend: "down",
      icon: ListTodo,
    },
  ];

  const financialStats = [
    {
      title: t("dashboard.stats.monthlyRevenue"),
      value: "12,450,000",
      change: "+12%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: t("dashboard.stats.monthlyExpenses"),
      value: "8,230,000",
      change: "+5%",
      trend: "up",
      icon: TrendingDown,
    },
  ];

  const recentTasks = [
    {
      id: 1,
      title: "Irrigate mango field B2",
      status: "pending",
      priority: "high",
      dueDate: "Today",
    },
    {
      id: 2,
      title: "Apply fertilizer to cashew plot",
      status: "in_progress",
      priority: "medium",
      dueDate: "Tomorrow",
    },
    {
      id: 3,
      title: "Harvest ripe papayas",
      status: "pending",
      priority: "urgent",
      dueDate: "Today",
    },
    {
      id: 4,
      title: "Pest inspection - pineapple field",
      status: "completed",
      priority: "medium",
      dueDate: "Yesterday",
    },
    {
      id: 5,
      title: "Prepare new banana planting area",
      status: "pending",
      priority: "low",
      dueDate: "Next week",
    },
  ];

  const cropStatus = [
    {
      crop: "Mango",
      emoji: "🥭",
      fields: 8,
      status: "Flowering",
      progress: 45,
    },
    { crop: "Cashew", emoji: "🥜", fields: 5, status: "Growing", progress: 30 },
    {
      crop: "Pineapple",
      emoji: "🍍",
      fields: 4,
      status: "Fruiting",
      progress: 75,
    },
    {
      crop: "Banana",
      emoji: "🍌",
      fields: 3,
      status: "Harvesting",
      progress: 90,
    },
    { crop: "Papaya", emoji: "🍈", fields: 2, status: "Growing", progress: 40 },
  ];

  // Mock data for charts
  const revenueData = [
    { month: "Jan", revenue: 8500000, expenses: 6200000 },
    { month: "Feb", revenue: 9200000, expenses: 6800000 },
    { month: "Mar", revenue: 10100000, expenses: 7100000 },
    { month: "Apr", revenue: 11500000, expenses: 7800000 },
    { month: "May", revenue: 10800000, expenses: 7500000 },
    { month: "Jun", revenue: 12450000, expenses: 8230000 },
  ];

  const cropDistributionData = [
    { name: "Mango", value: 8 },
    { name: "Cashew", value: 5 },
    { name: "Pineapple", value: 4 },
    { name: "Banana", value: 3 },
    { name: "Papaya", value: 2 },
  ];

  const taskStatusData = [
    { status: "Pending", count: 18 },
    { status: "In Progress", count: 12 },
    { status: "Completed", count: 45 },
    { status: "Cancelled", count: 3 },
  ];

  const salesTrendData = [
    {
      date: "Week 1",
      Mango: 2500000,
      Cashew: 1800000,
      Pineapple: 1200000,
      Banana: 900000,
      Papaya: 600000,
    },
    {
      date: "Week 2",
      Mango: 2800000,
      Cashew: 2100000,
      Pineapple: 1400000,
      Banana: 1100000,
      Papaya: 700000,
    },
    {
      date: "Week 3",
      Mango: 3200000,
      Cashew: 2300000,
      Pineapple: 1600000,
      Banana: 1300000,
      Papaya: 800000,
    },
    {
      date: "Week 4",
      Mango: 3500000,
      Cashew: 2600000,
      Pineapple: 1800000,
      Banana: 1500000,
      Papaya: 900000,
    },
  ];

  const cropTypes = ["Mango", "Cashew", "Pineapple", "Banana", "Papaya"];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("dashboard.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.welcome")}, Admin! {t("dashboard.overview")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }
                >
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {financialStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value} XOF</div>
              <div className="flex items-center text-xs">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
                )}
                <span
                  className={
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }
                >
                  {stat.change}
                </span>
                <span className="ml-1 text-muted-foreground">
                  vs last month
                </span>
              </div>
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
              <CardTitle>{t("tasks.title")}</CardTitle>
              <CardDescription>
                Recent tasks requiring attention
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/en/dashboard/tasks">{t("common.viewAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent>
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
                    <TableCell className="font-medium">{task.title}</TableCell>
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
                      {task.dueDate}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Crop Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("crops.title")}</CardTitle>
              <CardDescription>
                Current crop status across all farms
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/en/dashboard/farms/crops">
                {t("common.viewAll")}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {cropStatus.map((crop) => (
                <div key={crop.crop} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{crop.emoji}</span>
                      <div>
                        <span className="font-medium">{crop.crop}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({crop.fields} fields)
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">{crop.status}</Badge>
                  </div>
                  <Progress value={crop.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Visual insights into your farm performance
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>
                Monthly financial performance (XOF)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenueData} />
            </CardContent>
          </Card>

          {/* Crop Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Crop Distribution</CardTitle>
              <CardDescription>
                Distribution of crops across all fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CropDistributionChart data={cropDistributionData} />
            </CardContent>
          </Card>

          {/* Task Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Task Status</CardTitle>
              <CardDescription>Overview of all tasks by status</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskStatusChart data={taskStatusData} />
            </CardContent>
          </Card>

          {/* Sales Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Weekly sales by crop type (XOF)</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesTrendChart data={salesTrendData} crops={cropTypes} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.quickActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link href="/en/dashboard/farms">
                <MapPin className="h-6 w-6" />
                <span>{t("farms.addFarm")}</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link href="/en/dashboard/tasks">
                <ListTodo className="h-6 w-6" />
                <span>{t("tasks.addTask")}</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link href="/en/dashboard/finance">
                <DollarSign className="h-6 w-6" />
                <span>{t("finance.addTransaction")}</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link href="/en/dashboard/agents">
                <Users className="h-6 w-6" />
                <span>AI Advisors</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
