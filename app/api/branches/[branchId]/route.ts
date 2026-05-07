import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { branches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { branchSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { geocodeAddress } from "@/lib/geocoding";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const { branchId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = branchSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { address, ...rest } = validation.data;
    
    let latitude: string | undefined;
    let longitude: string | undefined;

    if (address) {
      const coords = await geocodeAddress(address);
      if (coords) {
        latitude = coords.lat.toString();
        longitude = coords.lng.toString();
      }
    }

    const [updatedBranch] = await db.update(branches)
      .set({
        ...rest,
        address,
        ...(latitude && { latitude }),
        ...(longitude && { longitude }),
        updatedAt: new Date() 
      })
      .where(and(
        eq(branches.id, branchId),
        eq(branches.tenantId, orgId)
      ))
      .returning();

    if (!updatedBranch) {
      return NextResponse.json({ error: "Branch not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(updatedBranch);
  } catch (error) {
    console.error("Error updating branch:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
