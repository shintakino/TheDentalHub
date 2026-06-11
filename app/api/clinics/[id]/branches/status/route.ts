import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { branches, appointments, branchOverrides, inventoryStock } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

export const branchStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: z.enum(["open", "emergency", "near_capacity", "closed"]),
  activeAppointments: z.number(),
  maxCapacity: z.number(),
  hasLowStock: z.boolean(),
  lowStockCount: z.number(),
  activeEmergency: z.boolean(),
});

export type BranchStatus = z.infer<typeof branchStatusSchema>;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    const { orgId } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date().toISOString();

    const branchData = await db.select({
      id: branches.id,
      name: branches.name,
      slug: branches.slug,
      maxCapacity: branches.maxCapacity,
      activeAppointments: sql<number>`(
        SELECT count(*) FROM ${appointments}
        WHERE ${appointments.branchId} = ${branches.id}
        AND ${appointments.status} IN ('checked_in', 'in_progress')
      )`.mapWith(Number),
      lowStockCount: sql<number>`(
        SELECT count(*) FROM ${inventoryStock}
        WHERE ${inventoryStock.branchId} = ${branches.id}
        AND ${inventoryStock.quantity} <= ${inventoryStock.lowStockThreshold}
      )`.mapWith(Number),
      activeEmergency: sql<boolean>`EXISTS (
        SELECT 1 FROM ${branchOverrides}
        WHERE ${branchOverrides.branchId} = ${branches.id}
        AND ${branchOverrides.isClosed} = true
        AND ${branchOverrides.startDate} <= ${now}
        AND ${branchOverrides.endDate} >= ${now}
      )`,
    })
    .from(branches)
    .where(eq(branches.tenantId, tenantId));

    const statusResults = branchData.map(b => {
      let status: "open" | "emergency" | "near_capacity" | "closed" = "open";
      
      if (b.activeEmergency) {
        status = "emergency";
      } else if (b.activeAppointments >= b.maxCapacity) {
        status = "near_capacity";
      }

      return {
        ...b,
        status,
        hasLowStock: b.lowStockCount > 0,
      };
    });

    return NextResponse.json(statusResults);
  } catch (error) {
    console.error("Error fetching branch status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
