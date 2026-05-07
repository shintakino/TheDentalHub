import { NextRequest, NextResponse } from "next/server";
import { searchMarketplace } from "@/lib/marketplace/queries";
import { refreshBranchAvailability } from "@/lib/marketplace/availability";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "7.0084");
    const lng = parseFloat(searchParams.get("lng") || "125.0139");
    const radius = parseFloat(searchParams.get("radius") || "25");
    const query = searchParams.get("query") || undefined;

    const results = await searchMarketplace({ lat, lng, radius, query });

    // Trigger stale cache refreshes in background
    const fifteenMinutes = 15 * 60 * 1000;
    const now = new Date().getTime();

    results.forEach((branch) => {
      const isStale = !branch.availabilityUpdatedAt || 
                      (now - new Date(branch.availabilityUpdatedAt).getTime() > fifteenMinutes);
      
      if (isStale) {
        // Background refresh - don't await to keep response snappy
        refreshBranchAvailability(branch.id).catch((err) => 
          console.error(`Failed to refresh availability for branch ${branch.id}:`, err)
        );
      }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Marketplace search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
