"use client";

import { useState, useEffect, useCallback } from "react";
import type { Sale } from "@/types";

export interface SaleFilters {
  farmId?: string;
  cropType?: string;
  startDate?: string;
  endDate?: string;
}

interface SaleTotals {
  totalQuantityKg: number;
  totalRevenue: number;
  averagePricePerKg: number;
  byCropType: Record<string, { quantity: number; revenue: number }>;
}

interface SaleData {
  sales: Sale[];
  totals: SaleTotals;
}

interface UseSalesReturn {
  data: SaleData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseCreateSaleReturn {
  mutate: (data: CreateSaleInput) => Promise<Sale>;
  isLoading: boolean;
  error: Error | null;
}

export interface CreateSaleInput {
  farmId: string;
  cropType: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  currency?: string;
  buyerName: string;
  buyerContact?: string;
  saleDate: string;
  notes?: string;
}

export function useSales(filters?: SaleFilters): UseSalesReturn {
  const [data, setData] = useState<SaleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSales = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.farmId) params.append("farmId", filters.farmId);
      if (filters?.cropType) params.append("cropType", filters.cropType);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/sales?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch sales: ${response.statusText}`);
      }

      const result = await response.json();

      // Calculate totals
      const sales = result.sales || [];
      const byCropType: Record<string, { quantity: number; revenue: number }> = {};

      let totalQuantityKg = 0;
      let totalRevenue = 0;

      sales.forEach((sale: Sale) => {
        const quantity = Number(sale.quantityKg);
        const revenue = Number(sale.totalAmount);

        totalQuantityKg += quantity;
        totalRevenue += revenue;

        if (!byCropType[sale.cropType]) {
          byCropType[sale.cropType] = { quantity: 0, revenue: 0 };
        }

        byCropType[sale.cropType].quantity += quantity;
        byCropType[sale.cropType].revenue += revenue;
      });

      const averagePricePerKg = totalQuantityKg > 0 ? totalRevenue / totalQuantityKg : 0;

      const totals: SaleTotals = {
        totalQuantityKg,
        totalRevenue,
        averagePricePerKg,
        byCropType,
      };

      setData({
        sales,
        totals,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.farmId, filters?.cropType, filters?.startDate, filters?.endDate]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchSales,
  };
}

export function useCreateSale(onSuccess?: () => void): UseCreateSaleReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (input: CreateSaleInput): Promise<Sale> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...input,
          currency: input.currency || "XOF",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create sale: ${response.statusText}`);
      }

      const result = await response.json();
      onSuccess?.();
      return result.sale;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
    error,
  };
}
