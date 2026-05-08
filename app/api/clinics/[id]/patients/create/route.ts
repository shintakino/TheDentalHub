import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { patientProfiles } from "@/lib/db/schema";
import { z } from "zod";

const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = orgId;

    const body = await request.json();
    const validated = patientSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid payload", details: validated.error }, { status: 400 });
    }

    const { name, email, phone } = validated.data;

    const [newPatient] = await db.insert(patientProfiles).values({
      name,
      email: email || null,
      phone: phone || null,
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(newPatient);
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
