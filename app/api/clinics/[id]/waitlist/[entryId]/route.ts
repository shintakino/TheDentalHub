import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waitlistEntries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { waitlistEntrySchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { id: tenantId, entryId } = await params;
    const { orgId } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    // Partial validation for PATCH
    const validation = waitlistEntrySchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const [updatedEntry] = await db
      .update(waitlistEntries)
      .set({
        ...validation.data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(waitlistEntries.id, entryId),
          eq(waitlistEntries.tenantId, tenantId)
        )
      )
      .returning();

    if (!updatedEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error updating waitlist entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { id: tenantId, entryId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [deletedEntry] = await db
      .delete(waitlistEntries)
      .where(
        and(
          eq(waitlistEntries.id, entryId),
          eq(waitlistEntries.tenantId, tenantId)
        )
      )
      .returning();

    if (!deletedEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting waitlist entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
