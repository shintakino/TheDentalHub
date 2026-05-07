import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBranchOccupancy } from "@/lib/admin/queries";

export async function GET() {
  const { orgId } = await auth();

  if (!orgId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const occupancy = await getBranchOccupancy(orgId);
    return NextResponse.json(occupancy);
  } catch (error) {
    console.error("[OCCUPANCY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
