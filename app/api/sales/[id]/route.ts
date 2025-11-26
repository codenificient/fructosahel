import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, sales } from "@/lib/db";
import { updateSaleSchema } from "@/lib/validations/sales";
import { handleApiError, success, notFound } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/sales/[id] - Get a single sale
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const sale = await db.query.sales.findFirst({
      where: eq(sales.id, id),
      with: {
        farm: true,
        creator: true,
      },
    });

    if (!sale) {
      return notFound("Sale");
    }

    return success(sale);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/sales/[id] - Update a sale
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateSaleSchema.parse(body);

    const existing = await db.query.sales.findFirst({
      where: eq(sales.id, id),
    });

    if (!existing) {
      return notFound("Sale");
    }

    const updateData: Record<string, unknown> = {};

    if (validatedData.cropType !== undefined) updateData.cropType = validatedData.cropType;
    if (validatedData.quantityKg !== undefined) updateData.quantityKg = validatedData.quantityKg.toString();
    if (validatedData.pricePerKg !== undefined) updateData.pricePerKg = validatedData.pricePerKg.toString();
    if (validatedData.currency !== undefined) updateData.currency = validatedData.currency;
    if (validatedData.buyerName !== undefined) updateData.buyerName = validatedData.buyerName;
    if (validatedData.buyerContact !== undefined) updateData.buyerContact = validatedData.buyerContact;
    if (validatedData.saleDate !== undefined) updateData.saleDate = validatedData.saleDate;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    // Recalculate total if quantity or price changed
    if (validatedData.quantityKg !== undefined || validatedData.pricePerKg !== undefined) {
      const quantity = validatedData.quantityKg ?? parseFloat(existing.quantityKg);
      const price = validatedData.pricePerKg ?? parseFloat(existing.pricePerKg);
      updateData.totalAmount = (quantity * price).toString();
    }
    if (validatedData.totalAmount !== undefined) {
      updateData.totalAmount = validatedData.totalAmount.toString();
    }

    const [updatedSale] = await db
      .update(sales)
      .set(updateData)
      .where(eq(sales.id, id))
      .returning();

    return success(updatedSale);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/sales/[id] - Delete a sale
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await db.query.sales.findFirst({
      where: eq(sales.id, id),
    });

    if (!existing) {
      return notFound("Sale");
    }

    await db.delete(sales).where(eq(sales.id, id));

    return success({ message: "Sale deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
