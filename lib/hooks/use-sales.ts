"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useOptimisticMutation,
  generateTempId,
  type OptimisticMutationState,
  type ToastHandlers,
} from "./use-optimistic-mutation";
import {
  useDataStore,
  useDataStoreAccess,
  type DataStoreState,
} from "./use-data-store";
import type { Sale, NewSale } from "@/types";

const API_BASE = "/api";
const SALES_STORE_KEY = "sales";

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

/**
 * Options for optimistic mutation hooks
 */
export interface SaleOptimisticOptions {
  /** Toast handlers for success/error notifications */
  toast?: ToastHandlers;
  /** Callback on successful mutation */
  onSuccess?: (data: Sale) => void;
  /** Callback on mutation error */
  onError?: (error: Error) => void;
  /** Callback after mutation settles (success or error) */
  onSettled?: () => void;
}

// Build query string from filters
function buildSaleQuery(filters?: SaleFilters): string {
  if (!filters) return "";

  const params = new URLSearchParams();
  if (filters.farmId) params.append("farmId", filters.farmId);
  if (filters.cropType) params.append("cropType", filters.cropType);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);

  const query = params.toString();
  return query ? `?${query}` : "";
}

// Generate store key based on filters
function getSalesStoreKey(filters?: SaleFilters): string {
  const query = buildSaleQuery(filters);
  return `${SALES_STORE_KEY}${query}`;
}

// Helper to recalculate totals
function recalculateSaleTotals(sales: Sale[]): SaleTotals {
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

  const averagePricePerKg =
    totalQuantityKg > 0 ? totalRevenue / totalQuantityKg : 0;

  return {
    totalQuantityKg,
    totalRevenue,
    averagePricePerKg,
    byCropType,
  };
}

/**
 * Fetch sales with optional filters and shared data store for optimistic updates
 */
export function useSalesOptimistic(
  filters?: SaleFilters,
): DataStoreState<SaleData> & {
  // Expose data in the expected format
} {
  const query = buildSaleQuery(filters);
  const storeKey = getSalesStoreKey(filters);

  // Custom fetch that transforms the API response
  const [data, setLocalData] = useState<SaleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { setData: setStoreData, getCurrentData } =
    useDataStoreAccess<SaleData>(storeKey);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/sales${query}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch sales: ${response.statusText}`);
      }

      const result = await response.json();
      const sales = result.sales || [];
      const totals = recalculateSaleTotals(sales);

      const saleData: SaleData = { sales, totals };
      setLocalData(saleData);
      setStoreData(saleData);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [query, setStoreData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to store changes
  useEffect(() => {
    const currentData = getCurrentData();
    if (currentData && currentData !== data) {
      setLocalData(currentData);
    }
  }, [getCurrentData, data]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setData: setStoreData,
    getCurrentData,
  };
}

/**
 * Legacy useSales hook (non-optimistic version)
 */
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
      const totals = recalculateSaleTotals(sales);

      setData({
        sales,
        totals,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    filters?.farmId,
    filters?.cropType,
    filters?.startDate,
    filters?.endDate,
  ]);

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

/**
 * Create a new sale with optimistic update
 */
export function useCreateSaleOptimistic(
  options: SaleOptimisticOptions = {},
  filters?: SaleFilters,
): OptimisticMutationState<CreateSaleInput, Sale> {
  const storeKey = getSalesStoreKey(filters);
  const { setData, getCurrentData } = useDataStoreAccess<SaleData>(storeKey);

  return useOptimisticMutation<SaleData, CreateSaleInput, Sale>(
    `${API_BASE}/sales`,
    {
      method: "POST",
      toast: options.toast,
      successMessage: "Sale recorded successfully",
      errorMessage: "Failed to record sale",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        createOptimisticData: (input, currentData) => {
          const tempSale: Sale = {
            id: generateTempId(),
            farmId: input.farmId,
            cropType: input.cropType as any,
            quantityKg: String(input.quantityKg),
            pricePerKg: String(input.pricePerKg),
            totalAmount: String(input.totalAmount),
            currency: input.currency || "XOF",
            buyerName: input.buyerName ?? null,
            buyerContact: input.buyerContact ?? null,
            saleDate: new Date(input.saleDate),
            notes: input.notes ?? null,
            createdBy: null,
            createdAt: new Date(),
          };

          const sales = [...(currentData?.sales || []), tempSale];
          const totals = recalculateSaleTotals(sales);

          return { sales, totals };
        },
      },
    },
  );
}

/**
 * Legacy useCreateSale hook (non-optimistic version)
 */
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
        throw new Error(
          errorData.error || `Failed to create sale: ${response.statusText}`,
        );
      }

      const result = await response.json();
      onSuccess?.();
      return result.sale;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred");
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

/**
 * Update an existing sale with optimistic update
 */
export function useUpdateSaleOptimistic(
  options: SaleOptimisticOptions = {},
  filters?: SaleFilters,
): OptimisticMutationState<{ id: string } & Partial<Sale>, Sale> {
  const storeKey = getSalesStoreKey(filters);
  const { setData, getCurrentData } = useDataStoreAccess<SaleData>(storeKey);

  return useOptimisticMutation<SaleData, { id: string } & Partial<Sale>, Sale>(
    (data) => `${API_BASE}/sales/${data.id}`,
    {
      method: "PUT",
      toast: options.toast,
      successMessage: "Sale updated successfully",
      errorMessage: "Failed to update sale",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        updateOptimisticData: (input, currentData) => {
          if (!currentData)
            return { sales: [], totals: recalculateSaleTotals([]) };

          const sales = currentData.sales.map((sale) =>
            sale.id === input.id ? { ...sale, ...input } : sale,
          );
          const totals = recalculateSaleTotals(sales);

          return { sales, totals };
        },
      },
    },
  );
}

/**
 * Delete a sale with optimistic update
 */
export function useDeleteSaleOptimistic(
  options: Omit<SaleOptimisticOptions, "onSuccess"> & {
    onSuccess?: (data: any) => void;
  } = {},
  filters?: SaleFilters,
): OptimisticMutationState<{ id: string }, any> {
  const storeKey = getSalesStoreKey(filters);
  const { setData, getCurrentData } = useDataStoreAccess<SaleData>(storeKey);

  return useOptimisticMutation<SaleData, { id: string }, any>(
    (data) => `${API_BASE}/sales/${data.id}`,
    {
      method: "DELETE",
      toast: options.toast,
      successMessage: "Sale deleted successfully",
      errorMessage: "Failed to delete sale",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        deleteOptimisticData: (input, currentData) => {
          if (!currentData)
            return { sales: [], totals: recalculateSaleTotals([]) };

          const sales = currentData.sales.filter(
            (sale) => sale.id !== input.id,
          );
          const totals = recalculateSaleTotals(sales);

          return { sales, totals };
        },
      },
    },
  );
}
