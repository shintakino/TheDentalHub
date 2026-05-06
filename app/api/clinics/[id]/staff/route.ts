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

    const staffList = memberships.data.map((membership) => {
      const dbInfo = staffInfo.find((s) => s.userId === membership.publicUserData?.userId);
      return {
        id: membership.id,
        userId: membership.publicUserData?.userId,
        name: membership.publicUserData?.firstName + " " + membership.publicUserData?.lastName,
        email: membership.publicUserData?.identifier,
        role: membership.role,
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
