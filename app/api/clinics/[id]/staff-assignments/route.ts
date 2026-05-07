import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staffAssignments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { staffAssignmentSchema } from "@/lib/validations";
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

    const assignments = await db.query.staffAssignments.findMany({
      where: eq(staffAssignments.tenantId, tenantId),
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching staff assignments:", error);
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

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = staffAssignmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    // Check if assignment already exists for this staff/day and remove it (re-assign)
    // Or we could allow multiple branches per day? 
    // Usually one staff is at one branch at a time.
    // For simplicity, let's allow multiple but warn in UI.
    // Actually, let's just insert/update.
    
    const [newAssignment] = await db.insert(staffAssignments).values({
      ...validation.data,
      tenantId,
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(newAssignment);
  } catch (error) {
    console.error("Error creating staff assignment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID required" }, { status: 400 });
    }

    await db.delete(staffAssignments).where(and(
      eq(staffAssignments.id, assignmentId),
      eq(staffAssignments.tenantId, tenantId)
    ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting staff assignment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
