import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { branchOverrides, appointments } from "@/lib/db/schema";
import { eq, and, gte, lte, or } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ branchId: string }> }
) {
  const { branchId } = await params;
  const { orgId } = await auth();

  if (!orgId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const overrides = await db.query.branchOverrides.findMany({
      where: and(
        eq(branchOverrides.branchId, branchId),
        eq(branchOverrides.tenantId, orgId)
      ),
      orderBy: [branchOverrides.startDate],
    });

    return NextResponse.json(overrides);
  } catch (error) {
    console.error("[OVERRIDES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ branchId: string }> }
) {
  const { branchId } = await params;
  const { orgId } = await auth();
  const body = await req.json();

  if (!orgId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { startDate, endDate, reason, isClosed } = body;

  if (!startDate || !endDate || !reason) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  try {
    const [override] = await db.insert(branchOverrides).values({
      tenantId: orgId,
      branchId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      isClosed: isClosed ?? true,
    }).returning();

    // Event Integration: Overrides must automatically trigger the Cancellation/Rescheduling flow
    // For now, we'll flag appointments in this range as needing rescheduling
    // In a real app, this might trigger emails/SMS
    
    // We'll update the status of appointments in this range to 'cancelled' or similar
    // or just mark them as needing attention. The spec says "trigger the Cancellation/Rescheduling flow"
    
    // Let's find appointments in the range
    const impactedAppointments = await db.query.appointments.findMany({
      where: and(
        eq(appointments.branchId, branchId),
        gte(appointments.startTime, new Date(startDate)),
        lte(appointments.startTime, new Date(endDate))
      )
    });

    // For simplicity, we'll log them or update them to cancelled
    if (impactedAppointments.length > 0) {
      await db.update(appointments)
        .set({ status: 'cancelled' })
        .where(and(
          eq(appointments.branchId, branchId),
          gte(appointments.startTime, new Date(startDate)),
          lte(appointments.startTime, new Date(endDate))
        ));
      
      // Note: Feature 13 integration would happen here (sending notifications)
    }

    return NextResponse.json(override);
  } catch (error) {
    console.error("[OVERRIDES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
