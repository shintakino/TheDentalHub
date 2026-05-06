import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db.query.appointments.findMany({
    where: eq(appointments.patientId, userId),
    with: {
      clinic: true,
      branch: true,
      service: true,
    },
    orderBy: [desc(appointments.startTime)],
  });

  return NextResponse.json(data);
}
