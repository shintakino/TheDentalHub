import { NextRequest, NextResponse } from "next/server";
import { getCampaignStats } from "@/lib/analytics/queries";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; campaignId: string }> }
) {
  try {
    const { id: tenantId, campaignId } = await params;
    const { orgId } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getCampaignStats(tenantId, campaignId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching campaign stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
