import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventoryStock, inventoryLogs, inventoryItems } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { inventoryAdjustmentSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!orgId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = inventoryAdjustmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { itemId, branchId, amount, reason } = validation.data;

    // Verify item belongs to tenant
    const item = await db.query.inventoryItems.findFirst({
      where: and(
        eq(inventoryItems.id, itemId),
        eq(inventoryItems.tenantId, orgId)
      ),
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Wrap in transaction
    const result = await db.transaction(async (tx) => {
      // Upsert stock record
      const [stock] = await tx.insert(inventoryStock)
        .values({
          itemId,
          branchId,
          quantity: amount,
          lowStockThreshold: "0.00", // Default if new
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [inventoryStock.itemId, inventoryStock.branchId],
          set: {
            quantity: sql`${inventoryStock.quantity} + ${amount}`,
            updatedAt: new Date(),
          },
        })
        .returning();

      // Create log
      await tx.insert(inventoryLogs)
        .values({
          itemId,
          branchId,
          changeAmount: amount,
          reason,
          performedBy: userId,
        });

      return stock;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error adjusting inventory stock:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
