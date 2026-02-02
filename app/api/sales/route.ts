import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, sales } from "@/lib/db";
import { createSaleSchema } from "@/lib/validations/sales";
import { handleApiError, success, created } from "@/lib/api/errors";

// GET /api/sales - List all sales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");
    const cropType = searchParams.get("cropType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const conditions = [];
    if (farmId) conditions.push(eq(sales.farmId, farmId));

    const allSales = await db.query.sales.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        farm: true,
        creator: true,
      },
      orderBy: (sales, { desc }) => [desc(sales.saleDate)],
    });

    // Additional filtering
    let filtered = allSales;
    if (cropType) {
      filtered = filtered.filter((s) => s.cropType === cropType);
    }
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((s) => new Date(s.saleDate) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((s) => new Date(s.saleDate) <= end);
    }

    // Calculate totals
    const totals = {
      totalQuantityKg: filtered.reduce(
        (sum, s) => sum + parseFloat(s.quantityKg),
        0,
      ),
      totalRevenue: filtered.reduce(
        (sum, s) => sum + parseFloat(s.totalAmount),
        0,
      ),
      averagePricePerKg:
        filtered.length > 0
          ? filtered.reduce((sum, s) => sum + parseFloat(s.pricePerKg), 0) /
            filtered.length
          : 0,
      byCropType: filtered.reduce(
        (acc, s) => {
          if (!acc[s.cropType]) {
            acc[s.cropType] = { quantity: 0, revenue: 0 };
          }
          acc[s.cropType].quantity += parseFloat(s.quantityKg);
          acc[s.cropType].revenue += parseFloat(s.totalAmount);
          return acc;
        },
        {} as Record<string, { quantity: number; revenue: number }>,
      ),
    };

    return success({
      sales: filtered,
      totals,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/sales - Create a new sale
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSaleSchema.parse(body);

    // Calculate total amount if not provided
    const totalAmount =
      validatedData.totalAmount ??
      validatedData.quantityKg * validatedData.pricePerKg;

    const [newSale] = await db
      .insert(sales)
      .values({
        farmId: validatedData.farmId,
        cropType: validatedData.cropType,
        quantityKg: validatedData.quantityKg.toString(),
        pricePerKg: validatedData.pricePerKg.toString(),
        totalAmount: totalAmount.toString(),
        currency: validatedData.currency,
        buyerName: validatedData.buyerName,
        buyerContact: validatedData.buyerContact,
        saleDate: validatedData.saleDate,
        notes: validatedData.notes,
        createdBy: validatedData.createdBy,
      })
      .returning();

    return created(newSale);
  } catch (error) {
    return handleApiError(error);
  }
}
