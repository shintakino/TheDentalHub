import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { serviceSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { getCachedServices } from "@/lib/db/cache";
import { revalidateTag } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    const { orgId } = await auth();

    console.log(`API: Fetching services for tenantId: ${tenantId}, user orgId: ${orgId}`);

    if (!orgId) {
      console.error("API: Unauthorized - No orgId in session");
      return NextResponse.json({ error: "Unauthorized: No active organization" }, { status: 401 });
    }

    if (orgId !== tenantId) {
      console.error(`API: Unauthorized - orgId mismatch. Session: ${orgId}, Path: ${tenantId}`);
      return NextResponse.json({ error: "Unauthorized: Organization mismatch" }, { status: 401 });
    }

    const clinicServices = await getCachedServices(tenantId);

    console.log(`API: Successfully fetched ${clinicServices.length} services`);
    return NextResponse.json(clinicServices);
  } catch (error) {
    console.error("Error fetching services:", error);
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
    const validation = serviceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const [newService] = await db.insert(services).values({
      ...validation.data,
      tenantId,
      updatedAt: new Date(),
    }).returning();

    // Invalidate cached services catalog
    revalidateTag(`services-${tenantId}`, "max");

    return NextResponse.json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
