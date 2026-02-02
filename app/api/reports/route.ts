import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { handleApiError, success } from "@/lib/api/errors";
import { db, farms, sales, tasks, transactions } from "@/lib/db";

export type ReportType = "financial" | "crop" | "task" | "productivity";
export type PeriodType = "monthly" | "quarterly" | "yearly";

interface FinancialSummary {
  period: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  salesCount: number;
  transactionCount: number;
}

interface CropPerformance {
  cropType: string;
  totalPlants: number;
  expectedYield: number;
  actualYield: number;
  yieldEfficiency: number;
  statusDistribution: Record<string, number>;
}

interface TaskCompletion {
  statusDistribution: Record<string, number>;
  overdueCount: number;
  completionRate: number;
  byPriority: Record<string, { total: number; completed: number }>;
  averageCompletionTime: number | null;
}

interface FarmProductivity {
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

// GET /api/reports - Generate reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") as ReportType;
    const period = (searchParams.get("period") as PeriodType) || "monthly";
    const farmId = searchParams.get("farmId");
    const cropType = searchParams.get("cropType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Parse dates
    const start = startDate ? new Date(startDate) : getDefaultStartDate(period);
    const end = endDate ? new Date(endDate) : new Date();

    switch (reportType) {
      case "financial":
        return success(
          await generateFinancialReport(start, end, period, farmId),
        );
      case "crop":
        return success(await generateCropReport(start, end, farmId, cropType));
      case "task":
        return success(await generateTaskReport(start, end, farmId));
      case "productivity":
        return success(await generateProductivityReport(start, end, farmId));
      default: {
        // Return all reports
        const [financial, crop, task, productivity] = await Promise.all([
          generateFinancialReport(start, end, period, farmId),
          generateCropReport(start, end, farmId, cropType),
          generateTaskReport(start, end, farmId),
          generateProductivityReport(start, end, farmId),
        ]);
        return success({ financial, crop, task, productivity });
      }
    }
  } catch (error) {
    return handleApiError(error);
  }
}

function getDefaultStartDate(period: PeriodType): Date {
  const now = new Date();
  switch (period) {
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth() - 11, 1);
    case "quarterly":
      return new Date(now.getFullYear() - 2, now.getMonth(), 1);
    case "yearly":
      return new Date(now.getFullYear() - 4, 0, 1);
    default:
      return new Date(now.getFullYear(), 0, 1);
  }
}

async function generateFinancialReport(
  startDate: Date,
  endDate: Date,
  period: PeriodType,
  farmId: string | null,
): Promise<{
  summary: FinancialSummary[];
  totals: { revenue: number; expenses: number; netProfit: number };
}> {
  // Fetch transactions
  const transactionConditions = [];
  if (farmId) transactionConditions.push(eq(transactions.farmId, farmId));

  const allTransactions = await db.query.transactions.findMany({
    where:
      transactionConditions.length > 0
        ? and(...transactionConditions)
        : undefined,
  });

  // Fetch sales
  const saleConditions = [];
  if (farmId) saleConditions.push(eq(sales.farmId, farmId));

  const allSales = await db.query.sales.findMany({
    where: saleConditions.length > 0 ? and(...saleConditions) : undefined,
  });

  // Filter by date range
  const filteredTransactions = allTransactions.filter((t) => {
    const date = new Date(t.transactionDate);
    return date >= startDate && date <= endDate;
  });

  const filteredSales = allSales.filter((s) => {
    const date = new Date(s.saleDate);
    return date >= startDate && date <= endDate;
  });

  // Group by period
  const summaryMap = new Map<string, FinancialSummary>();

  // Initialize periods
  const periods = generatePeriods(startDate, endDate, period);
  periods.forEach((p) => {
    summaryMap.set(p, {
      period: p,
      revenue: 0,
      expenses: 0,
      netProfit: 0,
      salesCount: 0,
      transactionCount: 0,
    });
  });

  // Process transactions
  filteredTransactions.forEach((t) => {
    const periodKey = getPeriodKey(new Date(t.transactionDate), period);
    const summary = summaryMap.get(periodKey);
    if (summary) {
      const amount = parseFloat(t.amount);
      if (t.type === "income") {
        summary.revenue += amount;
      } else {
        summary.expenses += amount;
      }
      summary.transactionCount++;
      summary.netProfit = summary.revenue - summary.expenses;
    }
  });

  // Process sales (add to revenue)
  filteredSales.forEach((s) => {
    const periodKey = getPeriodKey(new Date(s.saleDate), period);
    const summary = summaryMap.get(periodKey);
    if (summary) {
      summary.revenue += parseFloat(s.totalAmount);
      summary.salesCount++;
      summary.netProfit = summary.revenue - summary.expenses;
    }
  });

  const summaryArray = Array.from(summaryMap.values()).sort((a, b) =>
    a.period.localeCompare(b.period),
  );

  // Calculate totals
  const totals = summaryArray.reduce(
    (acc, s) => ({
      revenue: acc.revenue + s.revenue,
      expenses: acc.expenses + s.expenses,
      netProfit: acc.netProfit + s.netProfit,
    }),
    { revenue: 0, expenses: 0, netProfit: 0 },
  );

  return { summary: summaryArray, totals };
}

async function generateCropReport(
  startDate: Date,
  endDate: Date,
  farmId: string | null,
  cropTypeFilter: string | null,
): Promise<{
  performance: CropPerformance[];
  totals: {
    totalCrops: number;
    totalExpectedYield: number;
    totalActualYield: number;
    overallEfficiency: number;
  };
}> {
  // Fetch all crops with field data
  const allCrops = await db.query.crops.findMany({
    with: {
      field: {
        with: {
          farm: true,
        },
      },
    },
  });

  // Filter crops
  let filteredCrops = allCrops;

  if (farmId) {
    filteredCrops = filteredCrops.filter((c) => c.field?.farm?.id === farmId);
  }

  if (cropTypeFilter) {
    filteredCrops = filteredCrops.filter((c) => c.cropType === cropTypeFilter);
  }

  // Filter by planting date
  filteredCrops = filteredCrops.filter((c) => {
    if (!c.plantingDate) return true;
    const date = new Date(c.plantingDate);
    return date >= startDate && date <= endDate;
  });

  // Group by crop type
  const cropTypeMap = new Map<string, CropPerformance>();

  filteredCrops.forEach((c) => {
    if (!cropTypeMap.has(c.cropType)) {
      cropTypeMap.set(c.cropType, {
        cropType: c.cropType,
        totalPlants: 0,
        expectedYield: 0,
        actualYield: 0,
        yieldEfficiency: 0,
        statusDistribution: {},
      });
    }

    const perf = cropTypeMap.get(c.cropType);
    if (!perf) return;
    perf.totalPlants += c.numberOfPlants || 0;
    perf.expectedYield += parseFloat(c.expectedYieldKg || "0");
    perf.actualYield += parseFloat(c.actualYieldKg || "0");

    // Track status distribution
    if (!perf.statusDistribution[c.status]) {
      perf.statusDistribution[c.status] = 0;
    }
    perf.statusDistribution[c.status]++;
  });

  // Calculate efficiency
  cropTypeMap.forEach((perf) => {
    if (perf.expectedYield > 0) {
      perf.yieldEfficiency = (perf.actualYield / perf.expectedYield) * 100;
    }
  });

  const performance = Array.from(cropTypeMap.values());

  // Calculate totals
  const totals = performance.reduce(
    (acc, p) => ({
      totalCrops:
        acc.totalCrops +
        Object.values(p.statusDistribution).reduce((a, b) => a + b, 0),
      totalExpectedYield: acc.totalExpectedYield + p.expectedYield,
      totalActualYield: acc.totalActualYield + p.actualYield,
      overallEfficiency: 0,
    }),
    {
      totalCrops: 0,
      totalExpectedYield: 0,
      totalActualYield: 0,
      overallEfficiency: 0,
    },
  );

  if (totals.totalExpectedYield > 0) {
    totals.overallEfficiency =
      (totals.totalActualYield / totals.totalExpectedYield) * 100;
  }

  return { performance, totals };
}

async function generateTaskReport(
  startDate: Date,
  endDate: Date,
  farmId: string | null,
): Promise<TaskCompletion> {
  const conditions = [];
  if (farmId) conditions.push(eq(tasks.farmId, farmId));

  const allTasks = await db.query.tasks.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
  });

  // Filter by creation date
  const filteredTasks = allTasks.filter((t) => {
    const date = new Date(t.createdAt);
    return date >= startDate && date <= endDate;
  });

  // Status distribution
  const statusDistribution: Record<string, number> = {};
  const byPriority: Record<string, { total: number; completed: number }> = {};

  let overdueCount = 0;
  let completedCount = 0;
  let totalCompletionTime = 0;
  let completedWithTimeCount = 0;

  const now = new Date();

  filteredTasks.forEach((t) => {
    // Status distribution
    if (!statusDistribution[t.status]) {
      statusDistribution[t.status] = 0;
    }
    statusDistribution[t.status]++;

    // Priority breakdown
    if (!byPriority[t.priority]) {
      byPriority[t.priority] = { total: 0, completed: 0 };
    }
    byPriority[t.priority].total++;

    if (t.status === "completed") {
      completedCount++;
      byPriority[t.priority].completed++;

      // Calculate completion time if both dates exist
      if (t.completedAt && t.createdAt) {
        const created = new Date(t.createdAt);
        const completed = new Date(t.completedAt);
        const days =
          (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        totalCompletionTime += days;
        completedWithTimeCount++;
      }
    }

    // Check for overdue (has due date, not completed, past due)
    if (t.dueDate && t.status !== "completed" && t.status !== "cancelled") {
      const dueDate = new Date(t.dueDate);
      if (dueDate < now) {
        overdueCount++;
      }
    }
  });

  const completionRate =
    filteredTasks.length > 0
      ? (completedCount / filteredTasks.length) * 100
      : 0;
  const averageCompletionTime =
    completedWithTimeCount > 0
      ? totalCompletionTime / completedWithTimeCount
      : null;

  return {
    statusDistribution,
    overdueCount,
    completionRate,
    byPriority,
    averageCompletionTime,
  };
}

async function generateProductivityReport(
  startDate: Date,
  endDate: Date,
  farmId: string | null,
): Promise<{
  farms: FarmProductivity[];
  totals: {
    totalHectares: number;
    totalYield: number;
    totalRevenue: number;
    avgYieldPerHectare: number;
  };
}> {
  // Fetch all farms with related data
  const farmConditions = farmId ? eq(farms.id, farmId) : undefined;

  const allFarms = await db.query.farms.findMany({
    where: farmConditions,
    with: {
      fields: {
        with: {
          crops: true,
        },
      },
      sales: true,
    },
  });

  const farmProductivity: FarmProductivity[] = allFarms.map((farm) => {
    const totalHectares = parseFloat(farm.sizeHectares) || 0;
    const totalFields = farm.fields?.length || 0;

    let totalCrops = 0;
    let totalYieldKg = 0;

    farm.fields?.forEach((field) => {
      field.crops?.forEach((crop) => {
        totalCrops++;
        totalYieldKg += parseFloat(crop.actualYieldKg || "0");
      });
    });

    // Filter sales by date range
    const filteredSales = (farm.sales || []).filter((s) => {
      const date = new Date(s.saleDate);
      return date >= startDate && date <= endDate;
    });

    const totalRevenue = filteredSales.reduce(
      (sum, s) => sum + parseFloat(s.totalAmount),
      0,
    );

    return {
      farmId: farm.id,
      farmName: farm.name,
      totalHectares,
      totalFields,
      totalCrops,
      totalYieldKg,
      yieldPerHectare: totalHectares > 0 ? totalYieldKg / totalHectares : 0,
      totalRevenue,
      revenuePerHectare: totalHectares > 0 ? totalRevenue / totalHectares : 0,
    };
  });

  // Calculate totals
  const totals = farmProductivity.reduce(
    (acc, f) => ({
      totalHectares: acc.totalHectares + f.totalHectares,
      totalYield: acc.totalYield + f.totalYieldKg,
      totalRevenue: acc.totalRevenue + f.totalRevenue,
      avgYieldPerHectare: 0,
    }),
    { totalHectares: 0, totalYield: 0, totalRevenue: 0, avgYieldPerHectare: 0 },
  );

  if (totals.totalHectares > 0) {
    totals.avgYieldPerHectare = totals.totalYield / totals.totalHectares;
  }

  return { farms: farmProductivity, totals };
}

function generatePeriods(
  startDate: Date,
  endDate: Date,
  period: PeriodType,
): string[] {
  const periods: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    periods.push(getPeriodKey(current, period));

    switch (period) {
      case "monthly":
        current.setMonth(current.getMonth() + 1);
        break;
      case "quarterly":
        current.setMonth(current.getMonth() + 3);
        break;
      case "yearly":
        current.setFullYear(current.getFullYear() + 1);
        break;
    }
  }

  return [...new Set(periods)];
}

function getPeriodKey(date: Date, period: PeriodType): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  switch (period) {
    case "monthly":
      return `${year}-${month.toString().padStart(2, "0")}`;
    case "quarterly": {
      const quarter = Math.ceil(month / 3);
      return `${year}-Q${quarter}`;
    }
    case "yearly":
      return `${year}`;
    default:
      return `${year}-${month.toString().padStart(2, "0")}`;
  }
}
