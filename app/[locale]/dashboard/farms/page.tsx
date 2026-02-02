"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  MapPin,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
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
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useFarms,
  useCreateFarm,
  useUpdateFarm,
  useDeleteFarm,
} from "@/lib/hooks/use-farms";
import { useToastContext } from "@/components/toast-provider";
import type { Farm } from "@/types";

interface FarmFormData {
  name: string;
  location: string;
  country: "burkina_faso" | "mali" | "niger" | "";
  sizeHectares: string;
  latitude?: string;
  longitude?: string;
  description?: string;
  managerId?: string;
}

export default function FarmsPage() {
  const t = useTranslations();
  const { data: farms, isLoading, error, refetch } = useFarms();
  const createFarm = useCreateFarm();
  const updateFarm = useUpdateFarm();
  const deleteFarm = useDeleteFarm();
  const { toast } = useToastContext();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [formData, setFormData] = useState<FarmFormData>({
    name: "",
    location: "",
    country: "",
    sizeHectares: "",
    latitude: "",
    longitude: "",
    description: "",
    managerId: "",
  });

  const countryColors: Record<string, string> = {
    burkina_faso: "bg-green-500",
    mali: "bg-yellow-500",
    niger: "bg-orange-500",
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      country: "",
      sizeHectares: "",
      latitude: "",
      longitude: "",
      description: "",
      managerId: "",
    });
  };

  const handleAddFarm = async () => {
    try {
      if (
        !formData.name ||
        !formData.location ||
        !formData.country ||
        !formData.sizeHectares
      ) {
        toast({
          variant: "error",
          title: "Validation Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      await createFarm.mutate({
        name: formData.name,
        location: formData.location,
        country: formData.country as "burkina_faso" | "mali" | "niger",
        sizeHectares: formData.sizeHectares,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        description: formData.description || undefined,
        managerId: formData.managerId || undefined,
      });

      toast({
        variant: "success",
        title: "Farm Created",
        description: `${formData.name} has been added successfully`,
      });
      setIsAddDialogOpen(false);
      resetForm();
      await refetch();
    } catch (err) {
      toast({
        variant: "error",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create farm",
      });
    }
  };

  const handleEditClick = (farm: Farm) => {
    setSelectedFarm(farm);
    setFormData({
      name: farm.name,
      location: farm.location,
      country: farm.country,
      sizeHectares: farm.sizeHectares.toString(),
      latitude: farm.latitude?.toString() || "",
      longitude: farm.longitude?.toString() || "",
      description: farm.description || "",
      managerId: farm.managerId || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateFarm = async () => {
    if (!selectedFarm) return;

    try {
      if (
        !formData.name ||
        !formData.location ||
        !formData.country ||
        !formData.sizeHectares
      ) {
        toast({
          variant: "error",
          title: "Validation Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      await updateFarm.mutate({
        id: selectedFarm.id,
        name: formData.name,
        location: formData.location,
        country: formData.country as "burkina_faso" | "mali" | "niger",
        sizeHectares: formData.sizeHectares,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        description: formData.description || undefined,
        managerId: formData.managerId || undefined,
      });

      toast({
        variant: "success",
        title: "Farm Updated",
        description: `${formData.name} has been updated successfully`,
      });
      setIsEditDialogOpen(false);
      setSelectedFarm(null);
      resetForm();
      await refetch();
    } catch (err) {
      toast({
        variant: "error",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update farm",
      });
    }
  };

  const handleDeleteClick = (farm: Farm) => {
    setSelectedFarm(farm);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteFarm = async () => {
    if (!selectedFarm) return;

    try {
      await deleteFarm.mutate({ id: selectedFarm.id });
      toast({
        variant: "success",
        title: "Farm Deleted",
        description: `${selectedFarm.name} has been removed successfully`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedFarm(null);
      await refetch();
    } catch (err) {
      toast({
        variant: "error",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete farm",
      });
    }
  };

  const displayFarms = farms || [];
  const totalHectares = displayFarms.reduce(
    (acc, f) => acc + parseFloat(f.sizeHectares),
    0,
  );
  const uniqueCountries = new Set(displayFarms.map((f) => f.country)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("farms.title")}
          </h1>
          <p className="text-muted-foreground">
            Manage your farm locations and fields
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              {t("farms.addFarm")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t("farms.addFarm")}</DialogTitle>
              <DialogDescription>
                Add a new farm to your portfolio
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Farm Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter farm name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">{t("farms.location")} *</Label>
                <Input
                  id="location"
                  placeholder="City or region"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">{t("farms.country")} *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value: "burkina_faso" | "mali" | "niger") =>
                    setFormData({ ...formData, country: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="burkina_faso">
                      {t("farms.countries.burkina_faso")}
                    </SelectItem>
                    <SelectItem value="mali">
                      {t("farms.countries.mali")}
                    </SelectItem>
                    <SelectItem value="niger">
                      {t("farms.countries.niger")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">{t("farms.size")} (hectares) *</Label>
                <Input
                  id="size"
                  type="number"
                  placeholder="Size in hectares"
                  value={formData.sizeHectares}
                  onChange={(e) =>
                    setFormData({ ...formData, sizeHectares: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 12.3714"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="e.g., -1.5197"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details about the farm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleAddFarm}
                disabled={createFarm.isLoading}
              >
                {createFarm.isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("common.save")}
              </Button>
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
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{displayFarms.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Hectares
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {totalHectares.toFixed(1)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Farms</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{displayFarms.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{uniqueCountries}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Farms Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Farms</CardTitle>
          <CardDescription>
            A list of all your farms across the Sahel region
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 flex-1" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">Failed to load farms</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {error.message || "An error occurred while fetching farms"}
                </p>
              </div>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : displayFarms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <MapPin className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">No farms yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get started by adding your first farm
                </p>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("farms.addFarm")}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farm Name</TableHead>
                  <TableHead>{t("farms.location")}</TableHead>
                  <TableHead>{t("farms.country")}</TableHead>
                  <TableHead>{t("farms.size")}</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayFarms.map((farm) => (
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
                        <span
                          className={`h-2 w-2 rounded-full ${countryColors[farm.country]}`}
                        />
                        {t(`farms.countries.${farm.country}`)}
                      </div>
                    </TableCell>
                    <TableCell>{farm.sizeHectares} ha</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {farm.latitude && farm.longitude
                        ? `${parseFloat(farm.latitude).toFixed(4)}, ${parseFloat(farm.longitude).toFixed(4)}`
                        : "N/A"}
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
                            onClick={() => handleEditClick(farm)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(farm)}
                          >
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
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("common.edit")} Farm</DialogTitle>
            <DialogDescription>Update farm information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Farm Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter farm name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">{t("farms.location")} *</Label>
              <Input
                id="edit-location"
                placeholder="City or region"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-country">{t("farms.country")} *</Label>
              <Select
                value={formData.country}
                onValueChange={(value: "burkina_faso" | "mali" | "niger") =>
                  setFormData({ ...formData, country: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="burkina_faso">
                    {t("farms.countries.burkina_faso")}
                  </SelectItem>
                  <SelectItem value="mali">
                    {t("farms.countries.mali")}
                  </SelectItem>
                  <SelectItem value="niger">
                    {t("farms.countries.niger")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-size">{t("farms.size")} (hectares) *</Label>
              <Input
                id="edit-size"
                type="number"
                placeholder="Size in hectares"
                value={formData.sizeHectares}
                onChange={(e) =>
                  setFormData({ ...formData, sizeHectares: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input
                  id="edit-latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 12.3714"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input
                  id="edit-longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., -1.5197"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Additional details about the farm"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedFarm(null);
                resetForm();
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleUpdateFarm}
              disabled={updateFarm.isLoading}
            >
              {updateFarm.isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Farm</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedFarm?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedFarm(null);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteFarm}
              disabled={deleteFarm.isLoading}
            >
              {deleteFarm.isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
