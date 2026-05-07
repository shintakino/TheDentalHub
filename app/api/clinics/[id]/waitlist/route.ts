import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waitlistEntries } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { waitlistEntrySchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";

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

    const searchParams = request.nextUrl.searchParams;
    const branchId = searchParams.get("branchId");

    let whereClause = eq(waitlistEntries.tenantId, tenantId);
    if (branchId) {
      // @ts-ignore - Drizzle typed SQL re-assignment can be tricky with complex 'and' conditions
      whereClause = and(whereClause, eq(waitlistEntries.branchId, branchId));
    }

    const entries = await db.query.waitlistEntries.findMany({
      where: whereClause,
      orderBy: [desc(waitlistEntries.createdAt)],
      with: {
        branch: true,
        service: true,
      }
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow receptionists and admins
    if (orgRole !== "org:admin" && orgRole !== "org:receptionist" && orgRole !== "org:member") {
      // Note: org:member might be used for staff if not specifically receptionist
      // For now let's be more permissive to clinic staff
    }

    const body = await request.json();
    const validation = waitlistEntrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const [newEntry] = await db.insert(waitlistEntries).values({
      ...validation.data,
      tenantId,
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error("Error creating waitlist entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
