import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getNetworkHeatmap } from "@/lib/analytics/queries";

export async function GET() {
  const { orgId } = await auth();

  if (!orgId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data = await getNetworkHeatmap(orgId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[HEATMAP_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
