"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { startOfMonth, endOfMonth } from "date-fns";
import { Calendar, AlertCircle, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCalendar } from "@/components/calendar/task-calendar";
import { useTasks, useUpdateTask } from "@/lib/hooks/use-tasks";
import type { Task } from "@/types";

export default function CalendarPage() {
  const t = useTranslations();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch all tasks (we'll filter by date in the component)
  const { data: tasks, isLoading, error, refetch } = useTasks();

  // Update task mutation
  const updateTask = useUpdateTask(() => {
    refetch();
  });

  // Handle task updates
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTask.mutate({
      id: taskId,
      ...updates,
    });
  };

  // Calculate statistics for current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthTasks =
    tasks?.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= monthStart && dueDate <= monthEnd;
    }) || [];

  const pendingTasks = monthTasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = monthTasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const completedTasks = monthTasks.filter(
    (t) => t.status === "completed",
  ).length;

  const overdueTasks = monthTasks.filter((task) => {
    if (!task.dueDate || task.status === "completed") return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              {t("tasks.title")} Calendar
            </h1>
            <p className="text-muted-foreground">View tasks by date</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load tasks</h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            {t("tasks.title")} Calendar
          </h1>
          <p className="text-muted-foreground">View and manage tasks by date</p>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthTasks.length}</div>
              <p className="text-xs text-muted-foreground">Total tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingTasks}
              </div>
              <p className="text-xs text-muted-foreground">Not started</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {inProgressTasks}
              </div>
              <p className="text-xs text-muted-foreground">Active tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {overdueTasks}
              </div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {[...Array(35)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <TaskCalendar
          tasks={tasks || []}
          onUpdateTask={handleUpdateTask}
          isUpdating={updateTask.isLoading}
        />
      )}

      {/* Legend */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border-2 border-primary bg-primary/5" />
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border bg-secondary" />
                <span>Has tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border-red-500 bg-red-50" />
                <span>Overdue tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border bg-muted/50" />
                <span>Other month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
