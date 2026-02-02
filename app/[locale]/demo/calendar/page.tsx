"use client";

import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoTasks } from "@/lib/demo-data";

export default function DemoCalendarPage() {
  const t = useTranslations();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getTasksForDay = (day: number) => {
    return demoTasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return (
        dueDate.getDate() === day &&
        dueDate.getMonth() === currentMonth &&
        dueDate.getFullYear() === currentYear
      );
    });
  };

  const priorityColors = {
    low: "bg-gray-500",
    medium: "bg-blue-500",
    high: "bg-orange-500",
    urgent: "bg-red-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Task Calendar
          </h1>
          <p className="text-muted-foreground">
            View and manage your scheduled tasks
          </p>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          This is a demo page with sample data. Sign in to manage your real
          calendar.
        </p>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>
            {monthNames[currentMonth]} {currentYear}
          </CardTitle>
          <CardDescription>Tasks scheduled for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: firstDay }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="p-2 min-h-[100px] bg-muted/30 rounded"
              />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isToday =
                day === today.getDate() && currentMonth === today.getMonth();
              const tasks = getTasksForDay(day);

              return (
                <div
                  key={day}
                  className={`p-2 min-h-[100px] border rounded ${
                    isToday ? "bg-primary/10 border-primary" : "border-border"
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {tasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded text-white truncate ${priorityColors[task.priority]}`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {tasks.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{tasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Priority Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-500" />
              <span className="text-sm">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-sm">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span className="text-sm">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-sm">Urgent</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
