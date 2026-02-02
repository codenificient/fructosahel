"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Sprout,
  Calendar,
  Scale,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { demoCrops } from "@/lib/demo-data";
import type { CropType, CropStatus } from "@/types";

const cropTypeLabels: Record<CropType, string> = {
  mango: "Mango",
  cashew: "Cashew",
  pineapple: "Pineapple",
  banana: "Banana",
  papaya: "Papaya",
  avocado: "Avocado",
};

const cropStatusLabels: Record<CropStatus, string> = {
  planning: "Planning",
  planted: "Planted",
  growing: "Growing",
  flowering: "Flowering",
  fruiting: "Fruiting",
  harvesting: "Harvesting",
  harvested: "Harvested",
  dormant: "Dormant",
};

const statusColors: Record<
  CropStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  planning: "outline",
  planted: "secondary",
  growing: "default",
  flowering: "default",
  fruiting: "default",
  harvesting: "destructive",
  harvested: "secondary",
  dormant: "outline",
};

export default function DemoCropsPage() {
  const t = useTranslations();
  const [typeFilter, setTypeFilter] = useState<CropType | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<CropStatus | undefined>(
    undefined,
  );

  const filteredCrops = demoCrops.filter((crop) => {
    if (typeFilter && crop.cropType !== typeFilter) return false;
    if (statusFilter && crop.status !== statusFilter) return false;
    return true;
  });

  const totalCrops = filteredCrops.length;
  const activeCrops = filteredCrops.filter((c) =>
    ["growing", "flowering", "fruiting", "harvesting"].includes(c.status),
  ).length;
  const totalPlants = filteredCrops.reduce(
    (sum, c) => sum + (c.numberOfPlants || 0),
    0,
  );
  const expectedYield = filteredCrops.reduce(
    (sum, c) => sum + (c.expectedYieldKg ? parseFloat(c.expectedYieldKg) : 0),
    0,
  );

  const formatNumber = (value: string | number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("fr-FR").format(Number(value));
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sprout className="h-8 w-8 text-green-600" />
            Crops
          </h1>
          <p className="text-muted-foreground">
            Manage your crop plantings and track growth
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Crop
        </Button>
      </div>

      {/* Demo Banner */}
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          This is a demo page with sample data. Sign in to manage your real
          crops.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Crop Type:</Label>
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) =>
              setTypeFilter(value === "all" ? undefined : (value as CropType))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(cropTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label>Status:</Label>
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              setStatusFilter(
                value === "all" ? undefined : (value as CropStatus),
              )
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(cropStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              Total Crops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCrops}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" />
              Active Crops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeCrops}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Plants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalPlants)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Expected Yield
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(expectedYield)} kg
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crops Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Crops</CardTitle>
          <CardDescription>
            All crop plantings ({filteredCrops.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crop</TableHead>
                <TableHead>Variety</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plants</TableHead>
                <TableHead>Planting Date</TableHead>
                <TableHead>Expected Harvest</TableHead>
                <TableHead>Expected Yield</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCrops.map((crop) => (
                <TableRow key={crop.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Sprout className="h-4 w-4 text-green-600" />
                      {cropTypeLabels[crop.cropType]}
                    </div>
                  </TableCell>
                  <TableCell>{crop.variety || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[crop.status]}>
                      {cropStatusLabels[crop.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatNumber(crop.numberOfPlants)}</TableCell>
                  <TableCell>{formatDate(crop.plantingDate)}</TableCell>
                  <TableCell>{formatDate(crop.expectedHarvestDate)}</TableCell>
                  <TableCell>
                    {crop.expectedYieldKg
                      ? `${formatNumber(crop.expectedYieldKg)} kg`
                      : "-"}
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
