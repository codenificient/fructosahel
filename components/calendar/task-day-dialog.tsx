"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Calendar, User, Check, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Task, TaskStatus, TaskPriority } from "@/types";

interface TaskDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  tasks: Task[];
  onMarkComplete: (task: Task) => void;
  onMarkInProgress: (task: Task) => void;
  isUpdating?: boolean;
}

export function TaskDayDialog({
  open,
  onOpenChange,
  date,
  tasks,
  onMarkComplete,
  onMarkInProgress,
  isUpdating = false,
}: TaskDayDialogProps) {
  const t = useTranslations();

  const priorityColors: Record<
    TaskPriority,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    urgent: "destructive",
    high: "destructive",
    medium: "secondary",
    low: "outline",
  };

  const statusColors: Record<TaskStatus, "default" | "secondary" | "outline"> =
    {
      pending: "outline",
      in_progress: "default",
      completed: "secondary",
      cancelled: "secondary",
    };

  // Check if a task is overdue
  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === "completed") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(date, "MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription>
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} scheduled for
            this day
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No tasks scheduled for this day
            </div>
          ) : (
            tasks.map((task, index) => (
              <div key={task.id}>
                {index > 0 && <Separator className="my-3" />}

                <div
                  className={`space-y-3 rounded-lg border p-4 ${
                    isOverdue(task)
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : ""
                  }`}
                >
                  {/* Task header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold leading-none">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Task metadata */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={priorityColors[task.priority]}>
                      {t(`tasks.priorities.${task.priority}`)}
                    </Badge>
                    <Badge variant={statusColors[task.status]}>
                      {t(`tasks.statuses.${task.status}`)}
                    </Badge>
                    {isOverdue(task) && (
                      <Badge variant="destructive">Overdue</Badge>
                    )}
                  </div>

                  {/* Farm/Crop info */}
                  {((task as any).farm || (task as any).crop) && (
                    <div className="text-sm text-muted-foreground">
                      {(task as any).farm?.name && (
                        <div>Farm: {(task as any).farm.name}</div>
                      )}
                      {(task as any).crop?.cropType && (
                        <div>Crop: {(task as any).crop.cropType}</div>
                      )}
                    </div>
                  )}

                  {/* Assignee */}
                  {(task as any).assignee && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {(task as any).assignee.name}
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className="flex gap-2 pt-2">
                    {task.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkComplete(task)}
                        disabled={isUpdating}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Mark Complete
                      </Button>
                    )}
                    {task.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkInProgress(task)}
                        disabled={isUpdating}
                      >
                        <RefreshCw className="mr-1 h-4 w-4" />
                        Start Task
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
