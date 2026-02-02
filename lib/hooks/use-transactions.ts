"use client";

import { useFetch, type FetchState } from "./use-fetch";
import { useMutation, type MutationState } from "./use-mutation";
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
import type { Transaction, NewTransaction, TransactionType } from "@/types";

const API_BASE = "/api";
const TRANSACTIONS_STORE_KEY = "transactions";

export interface TransactionFilters {
  farmId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  totals: {
    income: number;
    expense: number;
    balance: number;
  };
}

/**
 * Options for optimistic mutation hooks
 */
export interface TransactionOptimisticOptions {
  /** Toast handlers for success/error notifications */
  toast?: ToastHandlers;
  /** Callback on successful mutation */
  onSuccess?: (data: Transaction) => void;
  /** Callback on mutation error */
  onError?: (error: Error) => void;
  /** Callback after mutation settles (success or error) */
  onSettled?: () => void;
}

// Build query string from filters
function buildTransactionQuery(filters?: TransactionFilters): string {
  if (!filters) return "";

  const params = new URLSearchParams();
  if (filters.farmId) params.append("farmId", filters.farmId);
  if (filters.type) params.append("type", filters.type);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);

  const query = params.toString();
  return query ? `?${query}` : "";
}

// Generate store key based on filters
function getTransactionsStoreKey(filters?: TransactionFilters): string {
  const query = buildTransactionQuery(filters);
  return `${TRANSACTIONS_STORE_KEY}${query}`;
}

// Helper to recalculate totals
function recalculateTotals(
  transactions: Transaction[],
): TransactionResponse["totals"] {
  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    const amount = Number(t.amount) || 0;
    if (t.type === "income") {
      income += amount;
    } else {
      expense += amount;
    }
  });

  return {
    income,
    expense,
    balance: income - expense,
  };
}

/**
 * Fetch transactions with optional filters and shared data store for optimistic updates
 */
export function useTransactionsOptimistic(
  filters?: TransactionFilters,
): DataStoreState<TransactionResponse> {
  const query = buildTransactionQuery(filters);
  const storeKey = getTransactionsStoreKey(filters);
  return useDataStore<TransactionResponse>(
    storeKey,
    `${API_BASE}/transactions${query}`,
  );
}

/**
 * Fetch transactions with optional filters and totals (legacy, non-optimistic version)
 */
export function useTransactions(
  filters?: TransactionFilters,
): FetchState<TransactionResponse> {
  const query = buildTransactionQuery(filters);
  return useFetch<TransactionResponse>(`${API_BASE}/transactions${query}`);
}

/**
 * Fetch single transaction by ID
 */
export function useTransaction(id: string | null): FetchState<Transaction> {
  const url = id ? `${API_BASE}/transactions/${id}` : null;
  return useFetch<Transaction>(url);
}

/**
 * Create a new transaction with optimistic update
 */
export function useCreateTransactionOptimistic(
  options: TransactionOptimisticOptions = {},
  filters?: TransactionFilters,
): OptimisticMutationState<NewTransaction, Transaction> {
  const storeKey = getTransactionsStoreKey(filters);
  const { setData, getCurrentData } =
    useDataStoreAccess<TransactionResponse>(storeKey);

  return useOptimisticMutation<
    TransactionResponse,
    NewTransaction,
    Transaction
  >(`${API_BASE}/transactions`, {
    method: "POST",
    toast: options.toast,
    successMessage: "Transaction created successfully",
    errorMessage: "Failed to create transaction",
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
    optimistic: {
      getCurrentData,
      setData,
      createOptimisticData: (input, currentData) => {
        const tempTransaction: Transaction = {
          id: generateTempId(),
          farmId: input.farmId ?? null,
          type: input.type,
          category: input.category,
          description: input.description ?? null,
          amount: String(input.amount),
          currency: input.currency || "XOF",
          transactionDate: input.transactionDate
            ? new Date(input.transactionDate)
            : new Date(),
          createdBy: input.createdBy ?? null,
          attachmentUrl: input.attachmentUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const transactions = [
          ...(currentData?.transactions || []),
          tempTransaction,
        ];
        const totals = recalculateTotals(transactions);

        return { transactions, totals };
      },
    },
  });
}

/**
 * Create a new transaction (legacy, non-optimistic version)
 */
export function useCreateTransaction(
  onSuccess?: (data: Transaction) => void,
): MutationState<NewTransaction> {
  return useMutation<NewTransaction>(`${API_BASE}/transactions`, {
    method: "POST",
    onSuccess,
  });
}

/**
 * Update an existing transaction with optimistic update
 */
export function useUpdateTransactionOptimistic(
  options: TransactionOptimisticOptions = {},
  filters?: TransactionFilters,
): OptimisticMutationState<{ id: string } & Partial<Transaction>, Transaction> {
  const storeKey = getTransactionsStoreKey(filters);
  const { setData, getCurrentData } =
    useDataStoreAccess<TransactionResponse>(storeKey);

  return useOptimisticMutation<
    TransactionResponse,
    { id: string } & Partial<Transaction>,
    Transaction
  >((data) => `${API_BASE}/transactions/${data.id}`, {
    method: "PUT",
    toast: options.toast,
    successMessage: "Transaction updated successfully",
    errorMessage: "Failed to update transaction",
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
    optimistic: {
      getCurrentData,
      setData,
      updateOptimisticData: (input, currentData) => {
        if (!currentData)
          return {
            transactions: [],
            totals: { income: 0, expense: 0, balance: 0 },
          };

        const transactions = currentData.transactions.map((transaction) =>
          transaction.id === input.id
            ? { ...transaction, ...input, updatedAt: new Date() }
            : transaction,
        );
        const totals = recalculateTotals(transactions);

        return { transactions, totals };
      },
    },
  });
}

/**
 * Update an existing transaction (legacy, non-optimistic version)
 */
export function useUpdateTransaction(
  onSuccess?: (data: Transaction) => void,
): MutationState<{ id: string } & Partial<Transaction>> {
  return useMutation<{ id: string } & Partial<Transaction>>(
    (data) => `${API_BASE}/transactions/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    },
  );
}

/**
 * Delete a transaction with optimistic update
 */
export function useDeleteTransactionOptimistic(
  options: Omit<TransactionOptimisticOptions, "onSuccess"> & {
    onSuccess?: (data: any) => void;
  } = {},
  filters?: TransactionFilters,
): OptimisticMutationState<{ id: string }, any> {
  const storeKey = getTransactionsStoreKey(filters);
  const { setData, getCurrentData } =
    useDataStoreAccess<TransactionResponse>(storeKey);

  return useOptimisticMutation<TransactionResponse, { id: string }, any>(
    (data) => `${API_BASE}/transactions/${data.id}`,
    {
      method: "DELETE",
      toast: options.toast,
      successMessage: "Transaction deleted successfully",
      errorMessage: "Failed to delete transaction",
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      optimistic: {
        getCurrentData,
        setData,
        deleteOptimisticData: (input, currentData) => {
          if (!currentData)
            return {
              transactions: [],
              totals: { income: 0, expense: 0, balance: 0 },
            };

          const transactions = currentData.transactions.filter(
            (transaction) => transaction.id !== input.id,
          );
          const totals = recalculateTotals(transactions);

          return { transactions, totals };
        },
      },
    },
  );
}

/**
 * Delete a transaction (legacy, non-optimistic version)
 */
export function useDeleteTransaction(
  onSuccess?: (data: any) => void,
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/transactions/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    },
  );
}
