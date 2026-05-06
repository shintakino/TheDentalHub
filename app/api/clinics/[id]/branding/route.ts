import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clinics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateBrandingSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { orgId, orgRole } = await auth();
    
    // id is the tenantId (Clerk Organization ID)
    if (!orgId || orgId !== id) {
      return NextResponse.json({ error: "Unauthorized: Organization mismatch" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateBrandingSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    await db.update(clinics)
      .set({ 
        ...validation.data, 
        updatedAt: new Date() 
      })
      .where(eq(clinics.tenantId, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating branding:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
