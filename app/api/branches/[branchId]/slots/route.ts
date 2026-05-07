import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { branches, services, appointments, staffAssignments, branchOverrides } from "@/lib/db/schema";
import { eq, and, gte, lte, or } from "drizzle-orm";
import { generateSlots } from "@/lib/scheduling/slot-generator";
import { getNextBestSlots } from "@/lib/scheduling/smart-router";
import { Suggestion } from "@/lib/validations";
import { z } from "zod";
import { startOfDay, endOfDay, parse } from "date-fns";
import { toDate } from "date-fns-tz";

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
  const dayStart = startOfDay(new Date(date));
  const dayEnd = endOfDay(new Date(date));

  // Fetch branch, service, staff assignments, and overrides in parallel
  const [branch, service, dayAssignments, activeOverrides] = await Promise.all([
    db.query.branches.findFirst({
      where: eq(branches.id, branchId),
    }),
    db.query.services.findFirst({
      where: eq(services.id, serviceId),
    }),
    db.query.staffAssignments.findMany({
      where: and(
        eq(staffAssignments.branchId, branchId),
        eq(staffAssignments.dayOfWeek, new Date(date).getDay())
      ),
    }),
    db.query.branchOverrides.findMany({
      where: and(
        eq(branchOverrides.branchId, branchId),
        lte(branchOverrides.startDate, dayEnd),
        gte(branchOverrides.endDate, dayStart)
      )
    })
  ]);

  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  // Get booked appointments for this branch/date
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

  // Convert staff assignments to ISO strings for the generator
  const staffWorking = dayAssignments.map(as => {
    const startString = `${date}T${as.startTime}:00`;
    const endString = `${date}T${as.endTime}:00`;
    return {
      startTime: toDate(startString, { timeZone: branch.timezone }).toISOString(),
      endTime: toDate(endString, { timeZone: branch.timezone }).toISOString(),
    };
  });

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
    maxCapacity: branch.maxCapacity,
    staffAssignments: staffWorking,
    overrides: activeOverrides.map(o => ({
      startTime: o.startDate.toISOString(),
      endTime: o.endDate.toISOString(),
      isClosed: o.isClosed
    })),
  });

  let suggestions: Suggestion[] = [];
  if (slots.length === 0) {
    suggestions = await getNextBestSlots(branch.tenantId, branchId, date, serviceId);
  }

  return NextResponse.json({ slots, suggestions });
}
