import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { appointments, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const appointment = await db.query.appointments.findFirst({
    where: and(eq(appointments.id, id), eq(appointments.patientId, userId)),
  });

  if (!appointment) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

  // 24h threshold check
  const now = new Date();
  const threshold = new Date(appointment.startTime.getTime() - 24 * 60 * 60 * 1000);
  if (now > threshold) {
    return NextResponse.json(
      { error: "Cannot cancel within 24 hours of appointment" },
      { status: 400 }
    );
  }

  if (appointment.status !== "confirmed") {
    return NextResponse.json(
      { error: "Only confirmed appointments can be cancelled" },
      { status: 400 }
    );
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(appointments)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(appointments.id, id));

      await tx.insert(auditLogs).values({
        tenantId: appointment.tenantId,
        appointmentId: appointment.id,
        userId,
        action: "PATIENT_CANCELLED",
        payload: { reason: "Patient self-serve cancellation" },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
