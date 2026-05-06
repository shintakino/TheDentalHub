import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, clinicalNotes, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getTenantId } from "@/lib/db/tenant";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const addNoteSchema = z.object({
  content: z.string().min(1, "Note content cannot be empty"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getTenantId();
    const { userId } = await auth();
    
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validationResult = addNoteSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 });
    }

    const { content } = validationResult.data;

    // Verify appointment exists
    const appt = await db.query.appointments.findFirst({
      where: and(eq(appointments.id, id), eq(appointments.tenantId, tenantId)),
    });

    if (!appt) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Insert Note and Audit Log in Transaction
    await db.transaction(async (tx) => {
      await tx.insert(clinicalNotes).values({
        tenantId,
        appointmentId: id,
        dentistId: userId,
        content,
      });

      await tx.insert(auditLogs).values({
        tenantId,
        appointmentId: id,
        userId,
        action: "clinical_note_added",
        payload: { noteLength: content.length },
      });
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error adding clinical note:", error);
    if (error instanceof Error && error.message.includes("No active organization found")) {
      return NextResponse.json({ error: "Unauthorized: No active organization" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
