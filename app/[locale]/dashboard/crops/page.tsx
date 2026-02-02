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
  AlertCircle,
  RefreshCw,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  useCrops,
  useCreateCrop,
  useUpdateCrop,
  useDeleteCrop,
} from "@/lib/hooks/use-crops";
import { useToastContext } from "@/components/toast-provider";
import type { Crop, CropType, CropStatus } from "@/types";
import type { CreateCropInput } from "@/lib/validations/crops";

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

export default function CropsPage() {
  const t = useTranslations();
  const { toast } = useToastContext();
  const [typeFilter, setTypeFilter] = useState<CropType | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<CropStatus | undefined>(
    undefined,
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  // Hooks
  const {
    data: crops,
    isLoading,
    error,
    refetch,
  } = useCrops({
    cropType: typeFilter,
    status: statusFilter,
  });

  const createCrop = useCreateCrop(() => {
    toast({
      variant: "success",
      title: "Crop Added",
      description: "New crop has been added successfully",
    });
    refetch();
    setIsAddDialogOpen(false);
    resetForm();
  });

  const updateCrop = useUpdateCrop(() => {
    toast({
      variant: "success",
      title: "Crop Updated",
      description: "Crop information has been updated",
    });
    refetch();
    setIsEditDialogOpen(false);
    setSelectedCrop(null);
    resetForm();
  });

  const deleteCrop = useDeleteCrop(() => {
    toast({
      variant: "success",
      title: "Crop Deleted",
      description: "Crop has been removed successfully",
    });
    refetch();
    setIsDeleteDialogOpen(false);
    setSelectedCrop(null);
  });

  // Form state
  const [formData, setFormData] = useState<Partial<CreateCropInput>>({
    fieldId: "",
    cropType: "mango",
    variety: "",
    status: "planning",
    plantingDate: undefined,
    expectedHarvestDate: undefined,
    numberOfPlants: undefined,
    expectedYieldKg: undefined,
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      fieldId: "",
      cropType: "mango",
      variety: "",
      status: "planning",
      plantingDate: undefined,
      expectedHarvestDate: undefined,
      numberOfPlants: undefined,
      expectedYieldKg: undefined,
      notes: "",
    });
  };

  const handleCreateCrop = async () => {
    if (!formData.fieldId || !formData.cropType) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Please select a field and crop type",
      });
      return;
    }

    try {
      await createCrop.mutate({
        fieldId: formData.fieldId!,
        cropType: formData.cropType!,
        variety: formData.variety,
        status: formData.status,
        plantingDate: formData.plantingDate,
        expectedHarvestDate: formData.expectedHarvestDate,
        numberOfPlants: formData.numberOfPlants,
        expectedYieldKg: formData.expectedYieldKg?.toString(),
        notes: formData.notes,
      });
    } catch (err) {
      toast({
        variant: "error",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create crop",
      });
    }
  };

  const handleUpdateCrop = async () => {
    if (!selectedCrop) return;

    try {
      await updateCrop.mutate({
        id: selectedCrop.id,
        cropType: formData.cropType,
        variety: formData.variety,
        status: formData.status,
        numberOfPlants: formData.numberOfPlants,
        expectedHarvestDate: formData.expectedHarvestDate,
        expectedYieldKg: formData.expectedYieldKg?.toString(),
        notes: formData.notes,
      });
    } catch (err) {
      toast({
        variant: "error",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update crop",
      });
    }
  };

  const handleDeleteCrop = async () => {
    if (!selectedCrop) return;

    try {
      await deleteCrop.mutate({ id: selectedCrop.id });
    } catch (err) {
      toast({
        variant: "error",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete crop",
      });
    }
  };

  const openEditDialog = (crop: Crop) => {
    setSelectedCrop(crop);
    setFormData({
      fieldId: crop.fieldId,
      cropType: crop.cropType,
      variety: crop.variety || "",
      status: crop.status,
      plantingDate: crop.plantingDate || undefined,
      expectedHarvestDate: crop.expectedHarvestDate || undefined,
      numberOfPlants: crop.numberOfPlants || undefined,
      expectedYieldKg: crop.expectedYieldKg
        ? Number(crop.expectedYieldKg)
        : undefined,
      notes: crop.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (crop: Crop) => {
    setSelectedCrop(crop);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const formatNumber = (value: string | number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("fr-FR").format(Number(value));
  };

  // Use real data from database
  const displayCrops = crops || [];

  // Apply local filtering if needed (though API should handle this)
  const filteredCrops = displayCrops;

  // Calculate stats
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crops</h1>
            <p className="text-muted-foreground">Manage your crop plantings</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load crops: {error.message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Crop
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Crop</DialogTitle>
              <DialogDescription>
                Add a new crop planting to your farm
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Field ID</Label>
                <Input
                  placeholder="Enter field ID"
                  value={formData.fieldId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, fieldId: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Crop Type</Label>
                  <Select
                    value={formData.cropType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, cropType: value as CropType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(cropTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Variety</Label>
                  <Input
                    placeholder="e.g., Kent, Hass"
                    value={formData.variety || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, variety: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as CropStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(cropStatusLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Number of Plants</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.numberOfPlants || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfPlants: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Planting Date</Label>
                  <Input
                    type="date"
                    value={
                      formData.plantingDate
                        ? new Date(formData.plantingDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plantingDate: e.target.value
                          ? new Date(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Expected Harvest</Label>
                  <Input
                    type="date"
                    value={
                      formData.expectedHarvestDate
                        ? new Date(formData.expectedHarvestDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedHarvestDate: e.target.value
                          ? new Date(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Expected Yield (kg)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.expectedYieldKg || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedYieldKg: parseFloat(e.target.value) || undefined,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional notes..."
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCrop}
                disabled={createCrop.isLoading}
              >
                {createCrop.isLoading ? "Adding..." : "Add Crop"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            {typeFilter || statusFilter
              ? `Filtered crops (${filteredCrops.length})`
              : `All crop plantings (${filteredCrops.length})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCrops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Sprout className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No crops found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {typeFilter || statusFilter
                  ? "Try changing your filters"
                  : "Get started by adding your first crop"}
              </p>
              {!typeFilter && !statusFilter && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Crop
                </Button>
              )}
            </div>
          ) : (
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
                    <TableCell>
                      {formatDate(crop.expectedHarvestDate)}
                    </TableCell>
                    <TableCell>
                      {crop.expectedYieldKg
                        ? `${formatNumber(crop.expectedYieldKg)} kg`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditDialog(crop)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => openDeleteDialog(crop)}
                          >
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
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Crop</DialogTitle>
            <DialogDescription>Update crop information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Crop Type</Label>
                <Select
                  value={formData.cropType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cropType: value as CropType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(cropTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Variety</Label>
                <Input
                  placeholder="e.g., Kent, Hass"
                  value={formData.variety || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, variety: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as CropStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(cropStatusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Number of Plants</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.numberOfPlants || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numberOfPlants: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Expected Yield (kg)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.expectedYieldKg || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedYieldKg: parseFloat(e.target.value) || undefined,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Expected Harvest</Label>
                <Input
                  type="date"
                  value={
                    formData.expectedHarvestDate
                      ? new Date(formData.expectedHarvestDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedHarvestDate: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedCrop(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCrop} disabled={updateCrop.isLoading}>
              {updateCrop.isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this crop record. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedCrop(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCrop}
              disabled={deleteCrop.isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCrop.isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
