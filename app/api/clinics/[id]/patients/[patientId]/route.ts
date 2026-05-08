import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPatientDetails } from "@/lib/admin/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = orgId;

    const patientDetails = await getPatientDetails(tenantId, patientId);

    if (!patientDetails.stats) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patientDetails);
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
