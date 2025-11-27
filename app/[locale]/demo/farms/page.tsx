"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
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
import { demoFarms } from "@/lib/demo-data";

const countryLabels: Record<string, string> = {
  burkina_faso: "Burkina Faso",
  mali: "Mali",
  niger: "Niger",
};

const countryFlags: Record<string, string> = {
  burkina_faso: "🇧🇫",
  mali: "🇲🇱",
  niger: "🇳🇪",
};

export default function DemoFarmsPage() {
  const t = useTranslations();

  const totalHectares = demoFarms.reduce((acc, f) => acc + parseFloat(f.sizeHectares), 0);
  const uniqueCountries = new Set(demoFarms.map((f) => f.country)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("farms.title")}</h1>
          <p className="text-muted-foreground">{t("farms.subtitle")}</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          {t("farms.addFarm")}
        </Button>
      </div>

      {/* Demo Banner */}
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          This is a demo page with sample data. Sign in to manage your real farms.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoFarms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hectares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHectares.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Farms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoFarms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCountries}</div>
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
                <TableHead>Location</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Size (ha)</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoFarms.map((farm) => (
                <TableRow key={farm.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {farm.name}
                    </div>
                  </TableCell>
                  <TableCell>{farm.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {countryFlags[farm.country]} {countryLabels[farm.country]}
                    </Badge>
                  </TableCell>
                  <TableCell>{parseFloat(farm.sizeHectares).toFixed(1)}</TableCell>
                  <TableCell>
                    {new Date(farm.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
