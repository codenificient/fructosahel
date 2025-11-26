import { useFetch, type FetchState } from "./use-fetch";
import { useMutation, type MutationState } from "./use-mutation";
import type { Transaction, NewTransaction, TransactionType } from "@/types";

const API_BASE = "/api";

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

// Fetch transactions with optional filters and totals
export function useTransactions(
  filters?: TransactionFilters
): FetchState<TransactionResponse> {
  const query = buildTransactionQuery(filters);
  return useFetch<TransactionResponse>(`${API_BASE}/transactions${query}`);
}

// Fetch single transaction by ID
export function useTransaction(id: string | null): FetchState<Transaction> {
  const url = id ? `${API_BASE}/transactions/${id}` : null;
  return useFetch<Transaction>(url);
}

// Create a new transaction
export function useCreateTransaction(
  onSuccess?: (data: Transaction) => void
): MutationState<NewTransaction> {
  return useMutation<NewTransaction>(`${API_BASE}/transactions`, {
    method: "POST",
    onSuccess,
  });
}

// Update an existing transaction
export function useUpdateTransaction(
  onSuccess?: (data: Transaction) => void
): MutationState<{ id: string } & Partial<Transaction>> {
  return useMutation<{ id: string } & Partial<Transaction>>(
    (data) => `${API_BASE}/transactions/${data.id}`,
    {
      method: "PUT",
      onSuccess,
    }
  );
}

// Delete a transaction
export function useDeleteTransaction(
  onSuccess?: (data: any) => void
): MutationState<{ id: string }> {
  return useMutation<{ id: string }>(
    (data) => `${API_BASE}/transactions/${data.id}`,
    {
      method: "DELETE",
      onSuccess,
    }
  );
}
