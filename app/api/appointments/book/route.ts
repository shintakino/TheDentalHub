import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { appointments, branches } from "@/lib/db/schema";
import { eq, and, or, lt, gt, lte, gte } from "drizzle-orm";
import { z } from "zod";
import { notificationTriggers } from "@/lib/notifications/triggers";
import { after } from "next/server";
import { Forecaster } from "@/lib/intelligence/forecaster";

const bookingSchema = z.object({
  serviceId: z.string().uuid(),
  branchId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  patientName: z.string(),
  patientEmail: z.string().email(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const validated = bookingSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ error: "Invalid payload", details: validated.error }, { status: 400 });
  }

  const { serviceId, branchId, startTime, endTime, patientName, patientEmail } = validated.data;

  // Fetch branch to get tenantId
  const branch = await db.query.branches.findFirst({
    where: eq(branches.id, branchId),
  });
  
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

  // Pre-calculate risk score
  const prediction = await Forecaster.predictNoShowRisk(userId, new Date(startTime));

  try {
    const appointment = await db.transaction(async (tx) => {
      // Atomic check for availability
      const conflicting = await tx.query.appointments.findFirst({
        where: and(
          eq(appointments.branchId, branchId),
          eq(appointments.status, "confirmed"),
          // Overlap condition: (start1 < end2) AND (end1 > start2)
          lt(appointments.startTime, new Date(endTime)),
          gt(appointments.endTime, new Date(startTime))
        ),
      });

      if (conflicting) {
        throw new Error("Slot already booked");
      }

      const [newAppointment] = await tx.insert(appointments).values({
        tenantId: branch.tenantId,
        branchId,
        serviceId,
        patientName,
        patientEmail,
        patientId: userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "confirmed",
        riskScore: prediction.riskScore,
      }).returning();

      return newAppointment;
    });

    // Trigger notification asynchronously
    after(async () => {
      try {
        await notificationTriggers.triggerBookingConfirmation(appointment.id);
        
        // If high risk, trigger priority reminder immediately or schedule it
        if (prediction.isHighRisk) {
          console.log(`High risk detected for appointment ${appointment.id}. Action: ${prediction.suggestedAction}`);
          // In a real system, we might schedule a specialized reminder here.
        }
      } catch (err) {
        console.error("Failed to trigger booking confirmation:", err);
      }
    });

    return NextResponse.json({ appointment });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: message }, 
      { status: message === "Slot already booked" ? 409 : 500 }
    );
  }
}
