import { db } from "@/lib/db";
import { branches, services, appointments, staffAssignments, branchOverrides } from "@/lib/db/schema";
import { eq, and, gte, lte, ne } from "drizzle-orm";
import { generateSlots } from "./slot-generator";
import { startOfDay, endOfDay } from "date-fns";
import { toDate } from "date-fns-tz";

export async function getNextBestSlots(
  tenantId: string,
  currentBranchId: string,
  date: string,
  serviceId: string
) {
  // 1. Get all branches for this tenant except current
  const allBranches = await db.query.branches.findMany({
    where: and(
      eq(branches.tenantId, tenantId),
      ne(branches.id, currentBranchId),
      eq(branches.isActive, true)
    )
  });

  // 2. Sort by distance (if we had lat/lng, we'd use Haversine, but for now we'll just take the first few)
  // In a real app, we'd use the current branch's lat/lng to sort.
  
  const suggestions = [];

  for (const branch of allBranches.slice(0, 3)) { // Limit to 3 alternative branches
    const dayOfWeek = new Date(date).getDay();
    const hours = branch.operatingHours.find(h => h.day === dayOfWeek);
    if (!hours || !hours.active) continue;

    const dayStart = startOfDay(new Date(date));
    const dayEnd = endOfDay(new Date(date));

    const [service, dayAssignments, activeOverrides, booked] = await Promise.all([
      db.query.services.findFirst({ where: eq(services.id, serviceId) }),
      db.query.staffAssignments.findMany({
        where: and(
          eq(staffAssignments.branchId, branch.id),
          eq(staffAssignments.dayOfWeek, dayOfWeek)
        )
      }),
      db.query.branchOverrides.findMany({
        where: and(
          eq(branchOverrides.branchId, branch.id),
          lte(branchOverrides.startDate, dayEnd),
          gte(branchOverrides.endDate, dayStart)
        )
      }),
      db.query.appointments.findMany({
        where: and(
          eq(appointments.branchId, branch.id),
          eq(appointments.status, "confirmed"),
          gte(appointments.startTime, dayStart),
          lte(appointments.startTime, dayEnd)
        )
      })
    ]);

    if (!service) continue;

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

    if (slots.length > 0) {
      suggestions.push({
        branchId: branch.id,
        branchName: branch.name,
        // Mock distance for now since we don't have a reference point in this function
        distance: (Math.random() * 5 + 1).toFixed(1), 
        nextSlot: slots[0].startTime,
      });
    }
  }

  return suggestions;
}
