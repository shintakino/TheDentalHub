import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clinics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { uploadClinicLogo } from "@/lib/storage/supabase";
import { auth } from "@clerk/nextjs/server";

export async function POST(
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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP, and SVG are allowed." }, { status: 400 });
    }

    // Validate file size (e.g., 2MB limit)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 2MB." }, { status: 400 });
    }

    const logoUrl = await uploadClinicLogo(id, file);

    await db.update(clinics)
      .set({ 
        logoUrl, 
        updatedAt: new Date() 
      })
      .where(eq(clinics.tenantId, id));

    return NextResponse.json({ logoUrl });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
