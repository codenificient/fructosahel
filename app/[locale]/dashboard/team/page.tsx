"use client";

import { useTranslations } from "next-intl";
import { Plus, MoreHorizontal, Edit, Trash2, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export default function TeamPage() {
  const t = useTranslations();

  // Mock data
  const teamMembers = [
    {
      id: "1",
      name: "Amadou Traore",
      email: "amadou@fructosahel.com",
      phone: "+226 70 12 34 56",
      role: "manager",
      farm: "Ferme Bobo",
      status: "active",
      avatar: null,
    },
    {
      id: "2",
      name: "Fatou Diallo",
      email: "fatou@fructosahel.com",
      phone: "+223 76 78 90 12",
      role: "manager",
      farm: "Plantation Sikasso",
      status: "active",
      avatar: null,
    },
    {
      id: "3",
      name: "Ibrahim Moussa",
      email: "ibrahim@fructosahel.com",
      phone: "+227 90 34 56 78",
      role: "manager",
      farm: "Verger Niamey",
      status: "active",
      avatar: null,
    },
    {
      id: "4",
      name: "Mariam Ouedraogo",
      email: "mariam@fructosahel.com",
      phone: "+226 70 56 78 90",
      role: "worker",
      farm: "Ferme Bobo",
      status: "active",
      avatar: null,
    },
    {
      id: "5",
      name: "Ousmane Kone",
      email: "ousmane@fructosahel.com",
      phone: "+226 70 89 01 23",
      role: "worker",
      farm: "Ferme Bobo",
      status: "active",
      avatar: null,
    },
    {
      id: "6",
      name: "Aissatou Barry",
      email: "aissatou@fructosahel.com",
      phone: "+223 76 45 67 89",
      role: "worker",
      farm: "Plantation Sikasso",
      status: "on_leave",
      avatar: null,
    },
    {
      id: "7",
      name: "Moussa Diarra",
      email: "moussa@fructosahel.com",
      phone: "+227 90 12 34 56",
      role: "admin",
      farm: "All Farms",
      status: "active",
      avatar: null,
    },
  ];

  const roleColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    admin: "default",
    manager: "secondary",
    worker: "outline",
    viewer: "outline",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("team.title")}</h1>
          <p className="text-muted-foreground">Manage your team members and their roles</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("team.addMember")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t("team.addMember")}</DialogTitle>
              <DialogDescription>Add a new team member to your organization</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+226 XX XX XX XX" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t("team.roles.admin")}</SelectItem>
                    <SelectItem value="manager">{t("team.roles.manager")}</SelectItem>
                    <SelectItem value="worker">{t("team.roles.worker")}</SelectItem>
                    <SelectItem value="viewer">{t("team.roles.viewer")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="farm">Assigned Farm</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Farms</SelectItem>
                    <SelectItem value="ferme-bobo">Ferme Bobo</SelectItem>
                    <SelectItem value="plantation-sikasso">Plantation Sikasso</SelectItem>
                    <SelectItem value="verger-niamey">Verger Niamey</SelectItem>
                    <SelectItem value="ferme-ouaga">Ferme Ouaga</SelectItem>
                  </SelectContent>
                </Select>
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
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter((m) => m.role === "manager").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter((m) => m.role === "worker").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter((m) => m.status === "active").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>All team members across your farms</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Farm</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {member.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleColors[member.role]}>
                      {t(`team.roles.${member.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.farm}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === "active" ? "success" : "secondary"}>
                      {member.status === "active" ? "Active" : "On Leave"}
                    </Badge>
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
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
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
        </CardContent>
      </Card>
    </div>
  );
}
