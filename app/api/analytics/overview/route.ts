import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTenantId } from "@/lib/db/tenant";
import { getAnalyticsOverview } from "@/lib/analytics/queries";
import { analyticsQuerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const tenantId = await getTenantId();

    // RBAC: Check for admin role in Clerk Org
    const role = sessionClaims?.metadata?.role;
    if (role !== "admin" && sessionClaims?.org_role !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const branchId = searchParams.get("branchId") || undefined;

    const validation = analyticsQuerySchema.safeParse({ startDate, endDate, branchId });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const data = await getAnalyticsOverview(
      tenantId,
      validation.data.startDate,
      validation.data.endDate,
      validation.data.branchId
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
