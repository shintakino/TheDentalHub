import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { mockDb } from "@/lib/db/mock-db";
import { z } from "zod";

const bookingSchema = z.object({
  serviceId: z.string().uuid().or(z.string()),
  branchId: z.string().uuid().or(z.string()),
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
  const branch = await mockDb.getBranchById(branchId);
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

  // Atomic check for availability
  const isAvailable = await mockDb.isSlotAvailable(branchId, startTime, endTime);
  if (!isAvailable) {
    return NextResponse.json({ error: "Slot already booked" }, { status: 409 });
  }

  try {
    const appointment = await mockDb.bookAppointment({
      tenantId: branch.tenantId,
      branchId,
      serviceId,
      patientName,
      patientEmail,
      patientId: userId,
      startTime,
      endTime,
    });

    return NextResponse.json({ appointment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
}
