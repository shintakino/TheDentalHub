import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { campaignSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    const { orgId } = await auth();

    console.log(`API: Fetching campaigns for tenantId: ${tenantId}, user orgId: ${orgId}`);

    if (!orgId) {
      console.error("API: Unauthorized - No orgId in session");
      return NextResponse.json({ error: "Unauthorized: No active organization" }, { status: 401 });
    }

    if (orgId !== tenantId) {
      console.error(`API: Unauthorized - orgId mismatch. Session: ${orgId}, Path: ${tenantId}`);
      return NextResponse.json({ error: "Unauthorized: Organization mismatch" }, { status: 401 });
    }

    const clinicCampaigns = await db.query.campaigns.findMany({
      where: eq(campaigns.tenantId, tenantId),
      orderBy: (campaigns, { desc }) => [desc(campaigns.createdAt)],
      with: {
        service: true,
      }
    });

    return NextResponse.json(clinicCampaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = campaignSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const [newCampaign] = await db.insert(campaigns).values({
      ...validation.data,
      tenantId,
      startDate: new Date(validation.data.startDate),
      endDate: new Date(validation.data.endDate),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(newCampaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
