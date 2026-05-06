import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/db/tenant";
import { mockDb } from "@/lib/db/mock-db";
import { generateSlots } from "@/lib/scheduling/slot-generator";
import { getSlotsQuerySchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const tenantId = await getTenantId();
    const resolvedParams = await params;
    const branchId = resolvedParams.branchId;

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");

    const validationResult = getSlotsQuerySchema.safeParse({ date, serviceId });
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 });
    }

    const branchConfig = await mockDb.getBranch(branchId, tenantId);
    if (!branchConfig) {
      return NextResponse.json({ error: "Branch not found or access denied" }, { status: 404 });
    }

    const bookings = await mockDb.getBookings(branchId, tenantId, validationResult.data.date);

    const availableSlots = generateSlots({
      date: validationResult.data.date,
      timezone: branchConfig.timezone,
      operatingHours: branchConfig.operatingHours,
      serviceDuration: branchConfig.serviceDuration,
      bufferTime: branchConfig.bufferTime,
      bookedAppointments: bookings.map(b => ({
        startTime: b.startTime,
        endTime: b.endTime
      }))
    });

    return NextResponse.json({ slots: availableSlots });
  } catch (err) {
    const error = err as Error;
    if (error.message && error.message.includes("No active organization found")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error generating slots:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
