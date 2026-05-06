import { NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { appointments, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { userId } = await auth();
  const body = await req.json();
  const { newStatus, reason } = body;

  if (!newStatus || !reason) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const appointmentId = params.id;

  try {
    await db.transaction(async (tx) => {
      // 1. Get current state for audit
      const [current] = await tx
        .select()
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (!current) {
        throw new Error("Appointment not found");
      }

      // 2. Perform override
      await tx
        .update(appointments)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(appointments.id, appointmentId));

      // 3. Log override
      await tx.insert(auditLogs).values({
        tenantId: current.tenantId,
        appointmentId: appointmentId,
        userId: userId!,
        action: "ADMIN_OVERRIDE",
        payload: {
          oldStatus: current.status,
          newStatus,
          reason,
          isSystemOverride: true,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_OVERRIDE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
