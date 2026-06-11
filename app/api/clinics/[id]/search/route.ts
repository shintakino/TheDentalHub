import { NextRequest, NextResponse } from "next/server";
import { globalSearch } from "@/lib/admin/search";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    const { orgId } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    const results = await globalSearch(tenantId, query);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in global search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
