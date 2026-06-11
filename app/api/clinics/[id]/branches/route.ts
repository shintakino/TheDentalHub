import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { branches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { branchSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { geocodeAddress } from "@/lib/geocoding";

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

    const clinicBranches = await db.query.branches.findMany({
      where: eq(branches.tenantId, tenantId),
      orderBy: (branches, { asc }) => [asc(branches.name)],
    });

    return NextResponse.json(clinicBranches);
  } catch (error) {
    console.error("Error fetching branches:", error);
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
    const validation = branchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { address, latitude, longitude, ...rest } = validation.data;
    
    let lat = latitude;
    let lng = longitude;

    if (!lat || !lng) {
      const coords = address ? await geocodeAddress(address) : null;
      if (coords) {
        lat = coords.lat.toString();
        lng = coords.lng.toString();
      }
    }

    const slug = validation.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const [newBranch] = await db.insert(branches).values({
      ...rest,
      address,
      slug,
      latitude: lat,
      longitude: lng,
      tenantId,
      isActive: validation.data.isActive ?? true,
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(newBranch);
  } catch (error) {
    console.error("Error creating branch:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
