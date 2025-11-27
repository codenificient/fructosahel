"use client";

import { useTranslations } from "next-intl";
import { Plus, Users, Shield, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { demoUsers } from "@/lib/demo-data";
import type { UserRole } from "@/types";

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  worker: "Worker",
  viewer: "Viewer",
};

const roleColors: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
  admin: "destructive",
  manager: "default",
  worker: "secondary",
  viewer: "outline",
};

const roleIcons: Record<UserRole, typeof Shield> = {
  admin: Shield,
  manager: Users,
  worker: User,
  viewer: Eye,
};

export default function DemoTeamPage() {
  const t = useTranslations();

  const roleStats = {
    admin: demoUsers.filter(u => u.role === "admin").length,
    manager: demoUsers.filter(u => u.role === "manager").length,
    worker: demoUsers.filter(u => u.role === "worker").length,
    viewer: demoUsers.filter(u => u.role === "viewer").length,
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            {t("team.title")}
          </h1>
          <p className="text-muted-foreground">{t("team.subtitle")}</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          {t("team.addMember")}
        </Button>
      </div>

      {/* Demo Banner */}
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          This is a demo page with sample data. Sign in to manage your real team.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-600" />
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.admin}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Managers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.manager}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              Workers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.worker}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            All team members across your organization ({demoUsers.length} members)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoUsers.map((user) => {
                const RoleIcon = roleIcons[user.role];
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={roleColors[user.role]} className="flex w-fit items-center gap-1">
                        <RoleIcon className="h-3 w-3" />
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
