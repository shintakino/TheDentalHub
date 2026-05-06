import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services, appointments } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { serviceSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  try {
    const { id: tenantId, serviceId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = serviceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const [updatedService] = await db.update(services)
      .set({ 
        ...validation.data, 
        updatedAt: new Date() 
      })
      .where(and(
        eq(services.id, serviceId),
        eq(services.tenantId, tenantId)
      ))
      .returning();

    if (!updatedService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  try {
    const { id: tenantId, serviceId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    // Check for active appointments
    const activeAppointments = await db.query.appointments.findFirst({
      where: and(
        eq(appointments.serviceId, serviceId),
        eq(appointments.tenantId, tenantId),
        gt(appointments.startTime, new Date())
      ),
    });

    if (activeAppointments) {
      return NextResponse.json({ 
        error: "Cannot delete service with active future appointments" 
      }, { status: 400 });
    }

    const [deletedService] = await db.delete(services)
      .where(and(
        eq(services.id, serviceId),
        eq(services.tenantId, tenantId)
      ))
      .returning();

    if (!deletedService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
