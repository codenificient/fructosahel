"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDay } from "./calendar-day";
import { TaskDayDialog } from "./task-day-dialog";
import type { Task, TaskStatus } from "@/types";

interface TaskCalendarProps {
  tasks: Task[];
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  isUpdating?: boolean;
}

export function TaskCalendar({ tasks, onUpdateTask, isUpdating = false }: TaskCalendarProps) {
  const t = useTranslations();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get all days to display in the calendar (including days from prev/next month)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const daysInCalendar = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  // Get tasks for selected date
  const selectedDateTasks = selectedDate
    ? tasks.filter((task) => {
        if (!task.dueDate) return false;
        return isSameDay(new Date(task.dueDate), selectedDate);
      })
    : [];

  // Task update handlers
  const handleMarkComplete = (task: Task) => {
    if (onUpdateTask) {
      const newStatus: TaskStatus = task.status === "completed" ? "pending" : "completed";
      onUpdateTask(task.id, { status: newStatus });
    }
  };

  const handleMarkInProgress = (task: Task) => {
    if (onUpdateTask) {
      onUpdateTask(task.id, { status: "in_progress" });
    }
  };

  // Week day names
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {daysInCalendar.map((date) => {
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isTodayDate = isToday(date);
                const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

                return (
                  <CalendarDay
                    key={date.toISOString()}
                    date={date}
                    tasks={tasks}
                    isToday={isTodayDate}
                    isCurrentMonth={isCurrentMonth}
                    isSelected={isSelected}
                    onClick={() => handleDayClick(date)}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Day Dialog */}
      <TaskDayDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        date={selectedDate || new Date()}
        tasks={selectedDateTasks}
        onMarkComplete={handleMarkComplete}
        onMarkInProgress={handleMarkInProgress}
        isUpdating={isUpdating}
      />
    </>
  );
}
