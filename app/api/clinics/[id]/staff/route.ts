import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staff } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth, createClerkClient } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    const { orgId } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch members from Clerk
    const memberships = await clerkClient.organizations.getOrganizationMembershipList({
      organizationId: tenantId,
    });

    // Fetch extra info from our DB
    const staffInfo = await db.query.staff.findMany({
      where: eq(staff.tenantId, tenantId),
    });

    // Auto-sync: Check for members in Clerk that are NOT in our DB
    for (const membership of memberships.data) {
      const userId = membership.publicUserData?.userId;
      if (!userId) continue;

      const exists = staffInfo.some(s => s.userId === userId);
      if (!exists) {
        // Create local record
        await db.insert(staff).values({
          tenantId,
          userId,
          name: (membership.publicUserData?.firstName || "") + " " + (membership.publicUserData?.lastName || ""),
          role: membership.role === "org:admin" ? "admin" : "dentist", // Default role mapping
          targetDailyHours: 8,
          updatedAt: new Date(),
        });
        
        // Refresh staffInfo for the final mapping if we added someone
        // Or just push to local staffInfo array if we want to avoid another query
        staffInfo.push({
          id: "", // We don't have the generated UUID here easily without returning, but we only need it for the find
          tenantId,
          userId,
          name: (membership.publicUserData?.firstName || "") + " " + (membership.publicUserData?.lastName || ""),
          role: membership.role === "org:admin" ? "admin" : "dentist",
          targetDailyHours: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
      }
    }

    const staffList = memberships.data.map((membership) => {
      const dbInfo = staffInfo.find((s) => s.userId === membership.publicUserData?.userId);
      return {
        id: dbInfo?.id || membership.id,
        userId: membership.publicUserData?.userId,
        name: membership.publicUserData?.firstName + " " + membership.publicUserData?.lastName,
        email: membership.publicUserData?.identifier,
        role: dbInfo?.role || (membership.role === "org:admin" ? "admin" : "dentist"),
        targetDailyHours: dbInfo?.targetDailyHours || 8,
        joinedAt: membership.createdAt,
      };
    });

    return NextResponse.json(staffList);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
