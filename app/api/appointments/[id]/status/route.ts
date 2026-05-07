import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, auditLogs, AppointmentStatus, appointmentStatusEnum } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getTenantId } from "@/lib/db/tenant";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { AppointmentStateMachine } from "@/lib/appointments/state-machine";
import { notificationTriggers } from "@/lib/notifications/triggers";
import { loyaltyLogic } from "@/lib/loyalty/logic";
import { after } from "next/server";

const updateStatusSchema = z.object({
  status: z.enum(appointmentStatusEnum),
  actualPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getTenantId();
    const { userId } = await auth();
    
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validationResult = updateStatusSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 });
    }

    const { status: newStatus, actualPrice } = validationResult.data;

    // 1. Fetch current appointment
    const currentAppt = await db.query.appointments.findFirst({
      where: and(eq(appointments.id, id), eq(appointments.tenantId, tenantId)),
      with: { service: true }
    });

    if (!currentAppt) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const currentStatus = currentAppt.status as AppointmentStatus;

    // 2. Validate Transition
    if (!AppointmentStateMachine.canTransition(currentStatus, newStatus)) {
      return NextResponse.json({ 
        error: `Invalid state transition from ${currentStatus} to ${newStatus}` 
      }, { status: 400 });
    }

    // 3. Execute Transaction
    await db.transaction(async (tx) => {
      const updateData: any = { 
        status: newStatus, 
        updatedAt: new Date() 
      };

      if (actualPrice) {
        updateData.actualPrice = actualPrice;
      } else if (newStatus === "completed" && !currentAppt.actualPrice) {
        // Fallback to service price if completing and no price set
        updateData.actualPrice = currentAppt.service.price;
      }

      await tx.update(appointments)
        .set(updateData)
        .where(eq(appointments.id, id));

      await tx.insert(auditLogs).values({
        tenantId,
        appointmentId: id,
        userId,
        action: "status_changed",
        payload: { from: currentStatus, to: newStatus },
      });
    });

    // 4. Trigger Notifications & Loyalty
    after(async () => {
      try {
        if (newStatus === "cancelled") {
          await notificationTriggers.triggerCancellationNotice(id);
        }
        if (newStatus === "completed" && currentAppt) {
          await loyaltyLogic.awardPointsForAppointment(currentAppt);
        }
      } catch (err) {
        console.error("Background task failed:", err);
      }
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    if (error instanceof Error && error.message.includes("No active organization found")) {
      return NextResponse.json({ error: "Unauthorized: No active organization" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
