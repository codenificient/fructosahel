"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types";
import { isSameDay } from "date-fns";

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function CalendarDay({
  date,
  tasks,
  isToday,
  isCurrentMonth,
  isSelected,
  onClick,
}: CalendarDayProps) {
  // Filter tasks for this specific date
  const dayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    return isSameDay(new Date(task.dueDate), date);
  });

  // Check if any tasks are overdue
  const hasOverdueTasks = dayTasks.some((task) => {
    if (!task.dueDate) return false;
    if (task.status === "completed" || task.status === "cancelled")
      return false;
    return new Date(task.dueDate) < new Date();
  });

  const hasTasks = dayTasks.length > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative min-h-[80px] w-full rounded-lg border p-2 text-left transition-all hover:bg-accent hover:shadow-md",
        !isCurrentMonth && "bg-muted/50 text-muted-foreground",
        isCurrentMonth && "bg-background",
        isToday && "border-primary border-2 bg-primary/5",
        isSelected && "ring-2 ring-primary ring-offset-2",
        hasOverdueTasks && "border-red-500 bg-red-50 dark:bg-red-950/20",
      )}
    >
      {/* Date number */}
      <div
        className={cn(
          "mb-1 flex items-center justify-between",
          isToday && "font-bold text-primary",
        )}
      >
        <span className="text-sm">{date.getDate()}</span>
        {isToday && <div className="h-2 w-2 rounded-full bg-primary" />}
      </div>

      {/* Task count badge */}
      {hasTasks && (
        <div className="flex flex-col gap-1">
          <Badge
            variant={hasOverdueTasks ? "destructive" : "secondary"}
            className="w-fit text-xs px-1.5 py-0"
          >
            {dayTasks.length} task{dayTasks.length > 1 ? "s" : ""}
          </Badge>

          {/* Show first task title (truncated) on larger screens */}
          {dayTasks[0] && (
            <div className="hidden md:block text-xs text-muted-foreground truncate">
              {dayTasks[0].title}
            </div>
          )}
        </div>
      )}
    </button>
  );
}
