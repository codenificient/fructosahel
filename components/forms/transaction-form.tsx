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
import { useCreateTransaction, useToast } from "@/lib/hooks";
import type { UploadResponse } from "@/lib/utils/files";

// Transaction categories
const EXPENSE_CATEGORIES = [
  "Seeds & Plants",
  "Fertilizer",
  "Pesticides",
  "Equipment",
  "Labor",
  "Fuel",
  "Irrigation",
  "Maintenance",
  "Transport",
  "Other",
] as const;

const INCOME_CATEGORIES = [
  "Crop Sales",
  "Subsidies",
  "Grants",
  "Other Income",
] as const;

interface TransactionFormProps {
  farmId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({
  farmId,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  const { toast } = useToast();
  const { mutate: createTransaction, isLoading } = useCreateTransaction(() => {
    toast({
      title: "Transaction created",
      description: "The transaction has been recorded successfully.",
      variant: "success",
    });
    onSuccess?.();
  });

  const categories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !amount) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "error",
      });
      return;
    }

    await createTransaction({
      farmId: farmId || undefined,
      type,
      category,
      amount: amount, // Keep as string since database expects decimal
      description: description || undefined,
      transactionDate: new Date(transactionDate),
      attachmentUrl: attachmentUrl || undefined,
    });
  };

  const handleFileUpload = (response: UploadResponse) => {
    if (response.url) {
      setAttachmentUrl(response.url);
    }
  };

  const handleFileRemove = () => {
    setAttachmentUrl(null);
  };

  const handleFileError = (error: string) => {
    toast({
      title: "Upload failed",
      description: error,
      variant: "error",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Type */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant={type === "expense" ? "default" : "outline"}
          onClick={() => {
            setType("expense");
            setCategory("");
          }}
          className="w-full"
        >
          Expense
        </Button>
        <Button
          type="button"
          variant={type === "income" ? "default" : "outline"}
          onClick={() => {
            setType("income");
            setCategory("");
          }}
          className="w-full"
        >
          Income
        </Button>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (XOF) *</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any additional details..."
          rows={3}
        />
      </div>

      {/* Receipt/Invoice Upload */}
      <div className="space-y-2">
        <Label>Receipt / Invoice (optional)</Label>
        <FileUpload
          category="receipts"
          accept="all"
          onUpload={handleFileUpload}
          onRemove={handleFileRemove}
          onError={handleFileError}
          initialUrl={attachmentUrl || undefined}
          label="Upload receipt or invoice"
          description="Drag and drop your receipt, or click to browse"
          compact
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
          {isLoading ? "Saving..." : "Save Transaction"}
        </Button>
      </div>
    </form>
  );
}

TransactionForm.displayName = "TransactionForm";
