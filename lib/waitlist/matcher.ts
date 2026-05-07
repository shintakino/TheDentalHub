import { db } from "@/lib/db";
import { waitlistEntries, appointments } from "@/lib/db/schema";
import { eq, and, inArray, or } from "drizzle-orm";

/**
 * Finds eligible waitlist entries for a cancelled or newly opened slot.
 * @param tenantId The clinic's tenant ID
 * @param branchId The branch where the slot opened
 * @param serviceId The service requested
 * @param startTime The start time of the open slot
 */
export async function findEligibleWaitlistEntries(
  tenantId: string,
  branchId: string,
  serviceId: string,
  startTime: Date
) {
  // Get day of week (0-6)
  const dayOfWeek = startTime.getDay().toString();

  // Find entries for this tenant, branch, and service with status 'waiting'
  const entries = await db.query.waitlistEntries.findMany({
    where: and(
      eq(waitlistEntries.tenantId, tenantId),
      eq(waitlistEntries.branchId, branchId),
      eq(waitlistEntries.serviceId, serviceId),
      eq(waitlistEntries.status, "waiting")
    ),
    orderBy: (waitlistEntries, { asc }) => [asc(waitlistEntries.createdAt)],
  });

  // Simple filter for preferred days if any specified
  // In a real app, this would be more complex (checking time ranges etc.)
  return entries.filter(entry => {
    if (!entry.preferredDays || entry.preferredDays.length === 0) return true;
    return entry.preferredDays.includes(dayOfWeek);
  });
}

/**
 * Marks a waitlist entry as notified.
 */
export async function markAsNotified(entryId: string) {
  return db
    .update(waitlistEntries)
    .set({ status: "notified", updatedAt: new Date() })
    .where(eq(waitlistEntries.id, entryId))
    .returning();
}
