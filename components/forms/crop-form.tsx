"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { useCreateCrop, useToast } from "@/lib/hooks";
import { cropTypeValues, cropStatusValues } from "@/lib/validations/crops";
import type { UploadResponse } from "@/lib/utils/files";
import type { CropType, CropStatus } from "@/types";

// Display labels for crop types
const CROP_TYPE_LABELS: Record<CropType, string> = {
  pineapple: "Pineapple",
  cashew: "Cashew",
  avocado: "Avocado",
  mango: "Mango",
  banana: "Banana",
  papaya: "Papaya",
  potato: "Potato",
  cowpea: "Cowpea",
  bambara_groundnut: "Bambara Groundnut",
  sorghum: "Sorghum",
  pearl_millet: "Pearl Millet",
  moringa: "Moringa",
  sweet_potato: "Sweet Potato",
  onion: "Onion",
  rice: "Rice",
  tomato: "Tomato",
  pepper: "Pepper",
  okra: "Okra",
  peanut: "Peanut",
  cassava: "Cassava",
  pigeon_pea: "Pigeon Pea",
  citrus: "Citrus",
  guava: "Guava",
};

// Display labels for crop statuses
const CROP_STATUS_LABELS: Record<CropStatus, string> = {
  planning: "Planning",
  planted: "Planted",
  growing: "Growing",
  flowering: "Flowering",
  fruiting: "Fruiting",
  harvesting: "Harvesting",
  harvested: "Harvested",
  dormant: "Dormant",
};

interface CropFormProps {
  fieldId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CropForm({ fieldId, onSuccess, onCancel }: CropFormProps) {
  const [cropType, setCropType] = useState<CropType | "">("");
  const [variety, setVariety] = useState("");
  const [status, setStatus] = useState<CropStatus>("planning");
  const [plantingDate, setPlantingDate] = useState("");
  const [expectedHarvestDate, setExpectedHarvestDate] = useState("");
  const [numberOfPlants, setNumberOfPlants] = useState("");
  const [expectedYieldKg, setExpectedYieldKg] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { toast } = useToast();
  const { mutate: createCrop, isLoading } = useCreateCrop(() => {
    toast({
      title: "Crop added",
      description: "The crop has been added successfully.",
      variant: "success",
    });
    onSuccess?.();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cropType) {
      toast({
        title: "Validation error",
        description: "Please select a crop type.",
        variant: "error",
      });
      return;
    }

    await createCrop({
      fieldId,
      cropType,
      variety: variety || undefined,
      status,
      plantingDate: plantingDate ? new Date(plantingDate) : undefined,
      expectedHarvestDate: expectedHarvestDate
        ? new Date(expectedHarvestDate)
        : undefined,
      numberOfPlants: numberOfPlants ? parseInt(numberOfPlants) : undefined,
      expectedYieldKg: expectedYieldKg || undefined, // Keep as string since database expects decimal
      notes: notes || undefined,
      imageUrl: imageUrl || undefined,
    });
  };

  const handleImageUpload = (response: UploadResponse) => {
    if (response.url) {
      setImageUrl(response.url);
    }
  };

  const handleImageRemove = () => {
    setImageUrl(null);
  };

  const handleImageError = (error: string) => {
    toast({
      title: "Image upload failed",
      description: error,
      variant: "error",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Crop Type */}
      <div className="space-y-2">
        <Label htmlFor="cropType">Crop Type *</Label>
        <Select
          value={cropType}
          onValueChange={(value) => setCropType(value as CropType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select crop type" />
          </SelectTrigger>
          <SelectContent>
            {cropTypeValues.map((type) => (
              <SelectItem key={type} value={type}>
                {CROP_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Variety */}
      <div className="space-y-2">
        <Label htmlFor="variety">Variety</Label>
        <Input
          id="variety"
          value={variety}
          onChange={(e) => setVariety(e.target.value)}
          placeholder="e.g., Smooth Cayenne, MD2"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as CropStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {cropStatusValues.map((s) => (
              <SelectItem key={s} value={s}>
                {CROP_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plantingDate">Planting Date</Label>
          <Input
            id="plantingDate"
            type="date"
            value={plantingDate}
            onChange={(e) => setPlantingDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedHarvestDate">Expected Harvest</Label>
          <Input
            id="expectedHarvestDate"
            type="date"
            value={expectedHarvestDate}
            onChange={(e) => setExpectedHarvestDate(e.target.value)}
          />
        </div>
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numberOfPlants">Number of Plants</Label>
          <Input
            id="numberOfPlants"
            type="number"
            min="1"
            value={numberOfPlants}
            onChange={(e) => setNumberOfPlants(e.target.value)}
            placeholder="e.g., 500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedYieldKg">Expected Yield (kg)</Label>
          <Input
            id="expectedYieldKg"
            type="number"
            min="0"
            step="0.01"
            value={expectedYieldKg}
            onChange={(e) => setExpectedYieldKg(e.target.value)}
            placeholder="e.g., 1000"
          />
        </div>
      </div>

      {/* Crop Photo */}
      <div className="space-y-2">
        <Label>Crop Photo (optional)</Label>
        <FileUpload
          category="crops"
          accept="images"
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          onError={handleImageError}
          initialUrl={imageUrl || undefined}
          label="Upload a photo of the crop"
          description="Add a photo to track crop growth"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about this crop..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Add Crop"}
        </Button>
      </div>
    </form>
  );
}

CropForm.displayName = "CropForm";
