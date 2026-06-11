import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPatients } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const resolvedParams = await params;
    const tenantIdFromUrl = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use the ID from the URL as the source of truth for the tenant in the API call,
    // as long as the user is authenticated. The layout already handles RBAC.
    const tenantId = tenantIdFromUrl;

    console.log(`GET /api/clinics/${tenantId}/patients - User: ${userId}, Org: ${orgId}`);

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const branchId = searchParams.get("branchId") || undefined;

    const { patients, totalCount } = await getPatients(tenantId, search, limit, offset, branchId);
    console.log(`Fetched ${patients.length} patients for tenant ${tenantId}`);

    return NextResponse.json({ data: patients, totalCount });
  } catch (error) {
    console.error("Error fetching patients:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
