import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { branches, appointments } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { branchSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { geocodeAddress } from "@/lib/geocoding";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; branchId: string }> }
) {
  try {
    const { id: tenantId, branchId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = branchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { address } = validation.data;
    let coords = null;
    if (address) {
      coords = await geocodeAddress(address);
    }

    const [updatedBranch] = await db.update(branches)
      .set({ 
        ...validation.data, 
        ...(coords ? { 
          latitude: coords.lat.toString(), 
          longitude: coords.lng.toString() 
        } : {}),
        updatedAt: new Date() 
      })
      .where(and(
        eq(branches.id, branchId),
        eq(branches.tenantId, tenantId)
      ))
      .returning();

    if (!updatedBranch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBranch);
  } catch (error) {
    console.error("Error updating branch:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; branchId: string }> }
) {
  try {
    const { id: tenantId, branchId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    // Check for active appointments (future appointments or not cancelled/completed)
    const activeAppointments = await db.query.appointments.findFirst({
      where: and(
        eq(appointments.branchId, branchId),
        eq(appointments.tenantId, tenantId),
        gt(appointments.startTime, new Date())
      ),
    });

    if (activeAppointments) {
      return NextResponse.json({ 
        error: "Cannot delete branch with active future appointments" 
      }, { status: 400 });
    }

    const [deletedBranch] = await db.delete(branches)
      .where(and(
        eq(branches.id, branchId),
        eq(branches.tenantId, tenantId)
      ))
      .returning();

    if (!deletedBranch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting branch:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
