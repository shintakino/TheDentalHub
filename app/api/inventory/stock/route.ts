import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventoryStock, inventoryItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { inventoryStockSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(request: NextRequest) {
  try {
    const { orgId, orgRole } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = inventoryStockSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { itemId, branchId, quantity, lowStockThreshold } = validation.data;

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

    const [updatedStock] = await db.insert(inventoryStock)
      .values({
        itemId,
        branchId,
        quantity,
        lowStockThreshold,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [inventoryStock.itemId, inventoryStock.branchId],
        set: {
          quantity,
          lowStockThreshold,
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json(updatedStock);
  } catch (error) {
    console.error("Error updating inventory stock:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
