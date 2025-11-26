"use client";

import { useTranslations } from "next-intl";
import { Plus, MoreHorizontal, Edit, Trash2, Calendar, User, Check } from "lucide-react";
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

export default function TasksPage() {
  const t = useTranslations();

  // Mock data
  const tasks = [
    { id: 1, title: "Irrigate mango field B2", description: "Apply 50mm water to field B2", farm: "Ferme Bobo", crop: "Mango", assignee: "Mariam Ouedraogo", status: "pending", priority: "high", dueDate: "2024-11-25" },
    { id: 2, title: "Apply fertilizer to cashew plot", description: "NPK 10-10-10, 500g per tree", farm: "Verger Niamey", crop: "Cashew", assignee: "Ibrahim Moussa", status: "in_progress", priority: "medium", dueDate: "2024-11-26" },
    { id: 3, title: "Harvest ripe papayas", description: "Sector C papayas ready for harvest", farm: "Ferme Bobo", crop: "Papaya", assignee: "Ousmane Kone", status: "pending", priority: "urgent", dueDate: "2024-11-25" },
    { id: 4, title: "Pest inspection - pineapple field", description: "Check for mealybugs and fruit flies", farm: "Plantation Sikasso", crop: "Pineapple", assignee: "Fatou Diallo", status: "completed", priority: "medium", dueDate: "2024-11-24" },
    { id: 5, title: "Prepare new banana planting area", description: "Clear and prepare 0.5ha for new banana plants", farm: "Ferme Ouaga", crop: "Banana", assignee: "Amadou Traore", status: "pending", priority: "low", dueDate: "2024-12-01" },
    { id: 6, title: "Prune mango trees after harvest", description: "Remove dead branches and shape trees", farm: "Ferme Bobo", crop: "Mango", assignee: "Mariam Ouedraogo", status: "pending", priority: "medium", dueDate: "2024-11-28" },
    { id: 7, title: "Install fruit fly traps", description: "Place traps in mango orchard", farm: "Verger Niamey", crop: "Mango", assignee: "Ibrahim Moussa", status: "completed", priority: "high", dueDate: "2024-11-23" },
  ];

  const priorityColors: Record<string, "default" | "secondary" | "destructive" | "warning" | "outline"> = {
    urgent: "destructive",
    high: "warning",
    medium: "secondary",
    low: "outline",
  };

  const statusColors: Record<string, "default" | "secondary" | "success" | "outline"> = {
    pending: "outline",
    in_progress: "default",
    completed: "success",
    cancelled: "secondary",
  };

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("tasks.title")}</h1>
          <p className="text-muted-foreground">Manage and track farm tasks</p>
        </div>
        <Dialog>
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
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" placeholder="Enter task title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Task details" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Farm</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select farm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ferme-bobo">Ferme Bobo</SelectItem>
                      <SelectItem value="plantation-sikasso">Plantation Sikasso</SelectItem>
                      <SelectItem value="verger-niamey">Verger Niamey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Crop</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mango">Mango</SelectItem>
                      <SelectItem value="cashew">Cashew</SelectItem>
                      <SelectItem value="pineapple">Pineapple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="papaya">Papaya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("tasks.assignedTo")}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amadou">Amadou Traore</SelectItem>
                      <SelectItem value="fatou">Fatou Diallo</SelectItem>
                      <SelectItem value="ibrahim">Ibrahim Moussa</SelectItem>
                      <SelectItem value="mariam">Mariam Ouedraogo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t("tasks.priority")}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">{t("tasks.priorities.urgent")}</SelectItem>
                      <SelectItem value="high">{t("tasks.priorities.high")}</SelectItem>
                      <SelectItem value="medium">{t("tasks.priorities.medium")}</SelectItem>
                      <SelectItem value="low">{t("tasks.priorities.low")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t("tasks.dueDate")}</Label>
                <Input type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t("common.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
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

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>View and manage all farm tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <TaskTable tasks={tasks} t={t} priorityColors={priorityColors} statusColors={statusColors} />
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <TaskTable tasks={pendingTasks} t={t} priorityColors={priorityColors} statusColors={statusColors} />
            </TabsContent>
            <TabsContent value="in_progress" className="mt-4">
              <TaskTable tasks={inProgressTasks} t={t} priorityColors={priorityColors} statusColors={statusColors} />
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <TaskTable tasks={completedTasks} t={t} priorityColors={priorityColors} statusColors={statusColors} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskTable({ tasks, t, priorityColors, statusColors }: {
  tasks: any[];
  t: any;
  priorityColors: Record<string, any>;
  statusColors: Record<string, any>;
}) {
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
          <TableRow key={task.id}>
            <TableCell>
              <div className="font-medium">{task.title}</div>
              <div className="text-sm text-muted-foreground">{task.description}</div>
            </TableCell>
            <TableCell>
              <div>{task.farm}</div>
              <div className="text-sm text-muted-foreground">{task.crop}</div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {task.assignee}
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
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {task.dueDate}
              </div>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Check className="mr-2 h-4 w-4" />
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
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
