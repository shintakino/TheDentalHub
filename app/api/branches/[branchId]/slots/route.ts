import { NextResponse } from "next/server";
import { mockDb } from "@/lib/db/mock-db";
import { generateSlots } from "@/lib/scheduling/slot-generator";
import { z } from "zod";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string().uuid().or(z.string()), // UUID or mock ID e.g. 's1'
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ branchId: string }> }
) {
  const { branchId } = await params;
  const { searchParams } = new URL(req.url);
  const validated = querySchema.safeParse({
    date: searchParams.get("date"),
    serviceId: searchParams.get("serviceId"),
  });

  if (!validated.success) {
    return NextResponse.json({ error: "Invalid parameters", details: validated.error }, { status: 400 });
  }

  const { date, serviceId } = validated.data;
  const branch = await mockDb.getBranchById(branchId);
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

  const service = await mockDb.getServiceById(serviceId);
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  // Get booked appointments for this branch/date
  const booked = await mockDb.getAppointmentsByBranchAndDate(branchId, date);

  // Find operating hours for the specific day of week
  // date-fns getDay() returns 0 for Sunday, 1 for Monday, etc.
  const dayOfWeek = new Date(date).getDay();
  const hours = branch.operatingHours.find(h => h.day === dayOfWeek);

  if (!hours || !hours.active) {
    return NextResponse.json({ slots: [] });
  }

  const slots = generateSlots({
    date,
    timezone: branch.timezone,
    operatingHours: { start: hours.open, end: hours.close },
    serviceDuration: service.duration,
    bufferTime: 15, // Default buffer
    bookedAppointments: booked.map(b => ({
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
    })),
  });

  return NextResponse.json({ slots });
}
