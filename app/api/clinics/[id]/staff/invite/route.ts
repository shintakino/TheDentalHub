import { NextRequest, NextResponse } from "next/server";
import { inviteStaffSchema } from "@/lib/validations";
import { auth, createClerkClient } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    const { orgId, orgRole, userId } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = inviteStaffSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { email, role, name } = validation.data;

    // Map internal role to Clerk role
    // For MVP: admin -> org:admin, others -> org:member
    const clerkRole = role === "admin" ? "org:admin" : "org:member";

    // Create invitation in Clerk
    const invitation = await clerkClient.organizations.createOrganizationInvitation({
      organizationId: tenantId,
      inviterUserId: userId!,
      emailAddress: email,
      role: clerkRole,
      publicMetadata: {
        internalRole: role,
        fullName: name,
      },
    });

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Error inviting staff:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
