import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/db/tenant";
import { mockDb } from "@/lib/db/mock-db";
import { bookAppointmentSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    const body = await request.json();

    const validationResult = bookAppointmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 });
    }

    const { branchId, serviceId, patientId, startTime, endTime } = validationResult.data;

    try {
      // The atomic lock is implemented within the db.bookAppointment function
      const appointment = await mockDb.bookAppointment({
        tenantId,
        branchId,
        serviceId,
        patientId,
        startTime,
        endTime,
      });

      return NextResponse.json({ appointment }, { status: 201 });
    } catch (dbErr) {
      const dbError = dbErr as Error;
      if (dbError.message && (dbError.message.includes("Lock acquisition failed") || dbError.message.includes("Double booking detected"))) {
        return NextResponse.json({ error: "The requested time slot is no longer available." }, { status: 409 });
      }
      throw dbErr;
    }
  } catch (err) {
    const error = err as Error;
    if (error.message && error.message.includes("No active organization found")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error booking appointment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
