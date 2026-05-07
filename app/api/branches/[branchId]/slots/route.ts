import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { branches, services, appointments } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { generateSlots } from "@/lib/scheduling/slot-generator";
import { z } from "zod";
import { startOfDay, endOfDay } from "date-fns";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string().uuid(),
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

  // Fetch branch and service in parallel
  const [branch, service] = await Promise.all([
    db.query.branches.findFirst({
      where: eq(branches.id, branchId),
    }),
    db.query.services.findFirst({
      where: eq(services.id, serviceId),
    }),
  ]);

  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  // Get booked appointments for this branch/date
  const dayStart = startOfDay(new Date(date));
  const dayEnd = endOfDay(new Date(date));

  const booked = await db.query.appointments.findMany({
    where: and(
      eq(appointments.branchId, branchId),
      eq(appointments.status, "confirmed"),
      gte(appointments.startTime, dayStart),
      lte(appointments.startTime, dayEnd)
    ),
  });

  // Find operating hours for the specific day of week
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
    bufferTime: 15,
    bookedAppointments: booked.map(b => ({
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
    })),
  });

  return NextResponse.json({ slots });
}
