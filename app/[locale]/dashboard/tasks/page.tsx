"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, MoreHorizontal, Edit, Trash2, Calendar, User, Check, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, type TaskFilters } from "@/lib/hooks/use-tasks";
import { useToastContext } from "@/components/toast-provider";
import { demoTasks } from "@/lib/demo-data";
import type { Task, TaskStatus, TaskPriority } from "@/types";

export default function TasksPage() {
  const t = useTranslations();
  const { toast } = useToastContext();
  const [filters, setFilters] = useState<TaskFilters>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("all");

  // Fetch tasks with filters
  const { data: tasks, isLoading, error, refetch } = useTasks(filters);

  // Mutations
  const createTask = useCreateTask(() => {
    toast({
      variant: "success",
      title: "Task Created",
      description: "New task has been added successfully",
    });
    refetch();
    setIsAddDialogOpen(false);
  });

  const updateTask = useUpdateTask(() => {
    toast({
      variant: "success",
      title: "Task Updated",
      description: "Task status has been updated",
    });
    refetch();
  });

  const deleteTask = useDeleteTask(() => {
    toast({
      variant: "success",
      title: "Task Deleted",
      description: "Task has been removed successfully",
    });
    refetch();
  });

  // Form state for adding tasks
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    farmId: "",
    cropId: "",
    assignedTo: "",
    priority: "medium" as TaskPriority,
    dueDate: "",
  });

  const handleCreateTask = async () => {
    if (!newTask.title) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Please enter a task title",
      });
      return;
    }

    // Get current user ID (in a real app, this would come from auth context)
    const createdBy = "00000000-0000-0000-0000-000000000000"; // Placeholder

    try {
      await createTask.mutate({
        title: newTask.title,
        description: newTask.description || undefined,
        farmId: newTask.farmId || undefined,
        cropId: newTask.cropId || undefined,
        assignedTo: newTask.assignedTo || undefined,
        createdBy,
        priority: newTask.priority,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        status: "pending",
      });

      // Reset form
      setNewTask({
        title: "",
        description: "",
        farmId: "",
        cropId: "",
        assignedTo: "",
        priority: "medium",
        dueDate: "",
      });
    } catch (err) {
      toast({
        variant: "error",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create task",
      });
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus: TaskStatus = task.status === "completed" ? "pending" : "completed";
    await updateTask.mutate({
      id: task.id,
      status: newStatus,
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm(t("tasks.confirmDelete") || "Are you sure you want to delete this task?")) {
      try {
        await deleteTask.mutate({ id: taskId });
      } catch (err) {
        toast({
          variant: "error",
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to delete task",
        });
      }
    }
  };

  const priorityColors: Record<TaskPriority, "default" | "secondary" | "destructive" | "outline"> = {
    urgent: "destructive",
    high: "destructive",
    medium: "secondary",
    low: "outline",
  };

  const statusColors: Record<TaskStatus, "default" | "secondary" | "outline"> = {
    pending: "outline",
    in_progress: "default",
    completed: "secondary",
    cancelled: "secondary",
  };

  // Use demo data if no real data exists
  const displayTasks = tasks && tasks.length > 0 ? tasks : demoTasks;
  const isUsingDemoData = !tasks || tasks.length === 0;

  // Filter tasks by status for tabs
  const allTasks = displayTasks;
  const pendingTasks = allTasks.filter(t => t.status === "pending");
  const inProgressTasks = allTasks.filter(t => t.status === "in_progress");
  const completedTasks = allTasks.filter(t => t.status === "completed");

  // Check if a task is overdue
  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === "completed") return false;
    return new Date(task.dueDate) < new Date();
  };

  // Format date
  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("tasks.title")}</h1>
            <p className="text-muted-foreground">Manage and track farm tasks</p>
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
          <h1 className="text-3xl font-bold tracking-tight">{t("tasks.title")}</h1>
          <p className="text-muted-foreground">Manage and track farm tasks</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("tasks.addTask")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t("tasks.addTask")}</DialogTitle>
              <DialogDescription>Create a new task for your team</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Task details"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("tasks.priority")}</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value as TaskPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">{t("tasks.priorities.urgent")}</SelectItem>
                      <SelectItem value="high">{t("tasks.priorities.high")}</SelectItem>
                      <SelectItem value="medium">{t("tasks.priorities.medium")}</SelectItem>
                      <SelectItem value="low">{t("tasks.priorities.low")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t("tasks.dueDate")}</Label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleCreateTask}
                disabled={createTask.isLoading || !newTask.title}
              >
                {createTask.isLoading ? "Creating..." : t("common.save")}
              </Button>
            </DialogFooter>
            {createTask.error && (
              <p className="text-sm text-destructive mt-2">{createTask.error.message}</p>
            )}
          </DialogContent>
        </Dialog>
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
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>View and manage all farm tasks</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.priority || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, priority: value === "all" ? undefined : (value as TaskPriority) })
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isUsingDemoData && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Showing demo data. Create your first task to see real data.
              </p>
            </div>
          )}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All ({allTasks.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <TaskTable
                tasks={allTasks}
                isLoading={isLoading}
                t={t}
                priorityColors={priorityColors}
                statusColors={statusColors}
                isOverdue={isOverdue}
                formatDate={formatDate}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                updateTask={updateTask}
              />
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <TaskTable
                tasks={pendingTasks}
                isLoading={isLoading}
                t={t}
                priorityColors={priorityColors}
                statusColors={statusColors}
                isOverdue={isOverdue}
                formatDate={formatDate}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                updateTask={updateTask}
              />
            </TabsContent>
            <TabsContent value="in_progress" className="mt-4">
              <TaskTable
                tasks={inProgressTasks}
                isLoading={isLoading}
                t={t}
                priorityColors={priorityColors}
                statusColors={statusColors}
                isOverdue={isOverdue}
                formatDate={formatDate}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                updateTask={updateTask}
              />
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <TaskTable
                tasks={completedTasks}
                isLoading={isLoading}
                t={t}
                priorityColors={priorityColors}
                statusColors={statusColors}
                isOverdue={isOverdue}
                formatDate={formatDate}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                updateTask={updateTask}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskTable({
  tasks,
  isLoading,
  t,
  priorityColors,
  statusColors,
  isOverdue,
  formatDate,
  onToggleComplete,
  onDelete,
  updateTask,
}: {
  tasks: Task[];
  isLoading: boolean;
  t: any;
  priorityColors: Record<TaskPriority, any>;
  statusColors: Record<TaskStatus, any>;
  isOverdue: (task: Task) => boolean;
  formatDate: (date: Date | string | null) => string;
  onToggleComplete: (task: Task) => void;
  onDelete: (id: string) => void;
  updateTask: any;
}) {
  // Loading skeleton
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Farm / Crop</TableHead>
            <TableHead>{t("tasks.assignedTo")}</TableHead>
            <TableHead>{t("tasks.priority")}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>{t("tasks.dueDate")}</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-64" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
        <p className="text-muted-foreground">Get started by creating a new task</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Farm / Crop</TableHead>
          <TableHead>{t("tasks.assignedTo")}</TableHead>
          <TableHead>{t("tasks.priority")}</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>{t("tasks.dueDate")}</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id} className={isOverdue(task) ? "bg-red-50 dark:bg-red-950/20" : ""}>
            <TableCell>
              <div className="font-medium">{task.title}</div>
              {task.description && (
                <div className="text-sm text-muted-foreground line-clamp-1">{task.description}</div>
              )}
            </TableCell>
            <TableCell>
              <div>{(task as any).farm?.name || "-"}</div>
              <div className="text-sm text-muted-foreground">
                {(task as any).crop?.cropType || "-"}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {(task as any).assignee?.name || "Unassigned"}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={priorityColors[task.priority]}>
                {t(`tasks.priorities.${task.priority}`)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={statusColors[task.status]}>
                {t(`tasks.statuses.${task.status}`)}
              </Badge>
            </TableCell>
            <TableCell>
              <div className={`flex items-center gap-2 ${isOverdue(task) ? "text-red-600 font-semibold" : ""}`}>
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(task.dueDate)}
                {isOverdue(task) && <span className="text-xs">(Overdue)</span>}
              </div>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={updateTask.isLoading}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onToggleComplete(task)}>
                    <Check className="mr-2 h-4 w-4" />
                    {task.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateTask.mutate({ id: task.id, status: "in_progress" as TaskStatus })}
                    disabled={task.status === "in_progress"}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Mark In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(task.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("common.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
