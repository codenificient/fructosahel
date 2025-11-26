"use client";

import { useTranslations } from "next-intl";
import { Plus, MapPin, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
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

export default function FarmsPage() {
  const t = useTranslations();

  // Mock data
  const farms = [
    {
      id: "1",
      name: "Ferme Bobo",
      location: "Bobo-Dioulasso",
      country: "burkina_faso",
      size: 85,
      fields: 12,
      manager: "Amadou Traore",
      status: "active",
    },
    {
      id: "2",
      name: "Plantation Sikasso",
      location: "Sikasso",
      country: "mali",
      size: 120,
      fields: 18,
      manager: "Fatou Diallo",
      status: "active",
    },
    {
      id: "3",
      name: "Verger Niamey",
      location: "Niamey",
      country: "niger",
      size: 45,
      fields: 6,
      manager: "Ibrahim Moussa",
      status: "active",
    },
    {
      id: "4",
      name: "Ferme Ouaga",
      location: "Ouagadougou",
      country: "burkina_faso",
      size: 65,
      fields: 8,
      manager: "Mariam Ouedraogo",
      status: "active",
    },
    {
      id: "5",
      name: "Exploitation Zinder",
      location: "Zinder",
      country: "niger",
      size: 55,
      fields: 7,
      manager: "Abdou Malam",
      status: "maintenance",
    },
  ];

  const countryColors: Record<string, string> = {
    burkina_faso: "bg-green-500",
    mali: "bg-yellow-500",
    niger: "bg-orange-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("farms.title")}</h1>
          <p className="text-muted-foreground">Manage your farm locations and fields</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("farms.addFarm")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t("farms.addFarm")}</DialogTitle>
              <DialogDescription>Add a new farm to your portfolio</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Farm Name</Label>
                <Input id="name" placeholder="Enter farm name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">{t("farms.location")}</Label>
                <Input id="location" placeholder="City or region" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">{t("farms.country")}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="burkina_faso">{t("farms.countries.burkina_faso")}</SelectItem>
                    <SelectItem value="mali">{t("farms.countries.mali")}</SelectItem>
                    <SelectItem value="niger">{t("farms.countries.niger")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">{t("farms.size")}</Label>
                <Input id="size" type="number" placeholder="Size in hectares" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Additional details about the farm" />
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
            <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hectares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farms.reduce((acc, f) => acc + f.size, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farms.reduce((acc, f) => acc + f.fields, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>

      {/* Farms Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Farms</CardTitle>
          <CardDescription>A list of all your farms across the Sahel region</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farm Name</TableHead>
                <TableHead>{t("farms.location")}</TableHead>
                <TableHead>{t("farms.country")}</TableHead>
                <TableHead>{t("farms.size")}</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>{t("farms.manager")}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farms.map((farm) => (
                <TableRow key={farm.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {farm.name}
                    </div>
                  </TableCell>
                  <TableCell>{farm.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${countryColors[farm.country]}`} />
                      {t(`farms.countries.${farm.country}`)}
                    </div>
                  </TableCell>
                  <TableCell>{farm.size} ha</TableCell>
                  <TableCell>{farm.fields}</TableCell>
                  <TableCell>{farm.manager}</TableCell>
                  <TableCell>
                    <Badge variant={farm.status === "active" ? "success" : "secondary"}>
                      {farm.status}
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
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
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
