import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventoryItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { inventoryItemSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await db.query.inventoryItems.findMany({
      where: eq(inventoryItems.tenantId, orgId),
      orderBy: [desc(inventoryItems.createdAt)],
      with: {
        stock: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, orgRole } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = inventoryItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const [newItem] = await db.insert(inventoryItems)
      .values({
        ...validation.data,
        tenantId: orgId,
      })
      .returning();

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
