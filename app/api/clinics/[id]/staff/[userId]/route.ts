import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staff } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const updateStaffSchema = z.object({
  role: z.enum(["admin", "dentist", "receptionist"]).optional(),
  targetDailyHours: z.number().min(0).max(24).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: tenantId, userId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateStaffSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { role, targetDailyHours } = validation.data;

    // Update Clerk role if provided
    if (role) {
      const clerkRole = role === "admin" ? "org:admin" : "org:member";
      await clerkClient.organizations.updateOrganizationMembership({
        organizationId: tenantId,
        userId,
        role: clerkRole,
      });
    }

    // Update local DB
    if (role || targetDailyHours !== undefined) {
      const existing = await db.query.staff.findFirst({
        where: and(eq(staff.userId, userId), eq(staff.tenantId, tenantId)),
      });

      if (existing) {
        await db.update(staff)
          .set({ 
            ...(role ? { role } : {}), 
            ...(targetDailyHours !== undefined ? { targetDailyHours } : {}),
            updatedAt: new Date() 
          })
          .where(eq(staff.id, existing.id));
      } else {
        // We might need to fetch the user name from Clerk if they just joined
        const user = await clerkClient.users.getUser(userId);
        await db.insert(staff).values({
          tenantId,
          userId,
          name: user.firstName + " " + user.lastName,
          role: role || "dentist", // Fallback
          targetDailyHours: targetDailyHours ?? 8,
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: tenantId, userId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    // Remove from Clerk Org
    await clerkClient.organizations.deleteOrganizationMembership({
      organizationId: tenantId,
      userId,
    });

    // Optionally keep DB record for historical reasons but mark as inactive or just leave it
    // The spec says "Staff removal must not delete historical appointment records" 
    // but the `staff` table doesn't have an `active` field yet.
    // For now, we'll just remove them from the org in Clerk.
    // If we want to soft-delete in DB:
    // await db.delete(staff).where(and(eq(staff.userId, userId), eq(staff.tenantId, tenantId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing staff member:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
