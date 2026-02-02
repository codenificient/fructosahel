import { type FetchState, useFetch } from "./use-fetch";

const API_BASE = "/api";

export type ReportType = "financial" | "crop" | "task" | "productivity";
export type PeriodType = "monthly" | "quarterly" | "yearly";

export interface ReportFilters {
  type?: ReportType;
  period?: PeriodType;
  farmId?: string;
  cropType?: string;
  startDate?: string;
  endDate?: string;
}

export interface FinancialSummary {
  period: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  salesCount: number;
  transactionCount: number;
}

export interface FinancialReportData {
  summary: FinancialSummary[];
  totals: {
    revenue: number;
    expenses: number;
    netProfit: number;
  };
}

export interface CropPerformance {
  cropType: string;
  totalPlants: number;
  expectedYield: number;
  actualYield: number;
  yieldEfficiency: number;
  statusDistribution: Record<string, number>;
}

export interface CropReportData {
  performance: CropPerformance[];
  totals: {
    totalCrops: number;
    totalExpectedYield: number;
    totalActualYield: number;
    overallEfficiency: number;
  };
}

export interface TaskReportData {
  statusDistribution: Record<string, number>;
  overdueCount: number;
  completionRate: number;
  byPriority: Record<string, { total: number; completed: number }>;
  averageCompletionTime: number | null;
}

export interface FarmProductivity {
  farmId: string;
  farmName: string;
  totalHectares: number;
  totalFields: number;
  totalCrops: number;
  totalYieldKg: number;
  yieldPerHectare: number;
  totalRevenue: number;
  revenuePerHectare: number;
}

export interface ProductivityReportData {
  farms: FarmProductivity[];
  totals: {
    totalHectares: number;
    totalYield: number;
    totalRevenue: number;
    avgYieldPerHectare: number;
  };
}

export interface AllReportsData {
  financial: FinancialReportData;
  crop: CropReportData;
  task: TaskReportData;
  productivity: ProductivityReportData;
}

// Build URL with query params
function buildReportUrl(filters: ReportFilters): string {
  const params = new URLSearchParams();

  if (filters.type) params.append("type", filters.type);
  if (filters.period) params.append("period", filters.period);
  if (filters.farmId) params.append("farmId", filters.farmId);
  if (filters.cropType) params.append("cropType", filters.cropType);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  return `${API_BASE}/reports${queryString ? `?${queryString}` : ""}`;
}

// Fetch all reports
export function useReports(
  filters: ReportFilters = {},
): FetchState<AllReportsData> {
  return useFetch<AllReportsData>(buildReportUrl(filters));
}

// Fetch financial report only
export function useFinancialReport(
  filters: Omit<ReportFilters, "type"> = {},
): FetchState<FinancialReportData> {
  return useFetch<FinancialReportData>(
    buildReportUrl({ ...filters, type: "financial" }),
  );
}

// Fetch crop report only
export function useCropReport(
  filters: Omit<ReportFilters, "type"> = {},
): FetchState<CropReportData> {
  return useFetch<CropReportData>(buildReportUrl({ ...filters, type: "crop" }));
}

// Fetch task report only
export function useTaskReport(
  filters: Omit<ReportFilters, "type"> = {},
): FetchState<TaskReportData> {
  return useFetch<TaskReportData>(buildReportUrl({ ...filters, type: "task" }));
}

// Fetch productivity report only
export function useProductivityReport(
  filters: Omit<ReportFilters, "type"> = {},
): FetchState<ProductivityReportData> {
  return useFetch<ProductivityReportData>(
    buildReportUrl({ ...filters, type: "productivity" }),
  );
}
