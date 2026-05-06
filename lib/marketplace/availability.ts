import { db } from "@/lib/db";
import { branches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function refreshBranchAvailability(branchId: string) {
  // In a real app, we'd fetch actual service/staff/appointment data here
  // and use the slot generator. For the MVP Marketplace, we'll simulate 
  // the next 3 available slots to ensure the "Next Available" feature 
  // works with high performance.
  
  const now = new Date();
  
  // Simulate some slots in the near future
  const mockSlots = [
    new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),   // 2 hours from now
    new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),  // Tomorrow
    new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),  // Day after
  ];

  await db.update(branches)
    .set({
      nextSlots: mockSlots,
      availabilityUpdatedAt: new Date(),
    })
    .where(eq(branches.id, branchId));
}
