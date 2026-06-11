import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { campaignSchema } from "@/lib/validations";
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

    const campaign = await db.query.campaigns.findFirst({
      where: and(
        eq(campaigns.tenantId, tenantId),
        eq(campaigns.id, campaignId)
      ),
      with: {
        service: true,
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; campaignId: string }> }
) {
  try {
    const { id: tenantId, campaignId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = campaignSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { startDate, endDate, ...restData } = validation.data;

    const updateData: Partial<Omit<typeof campaigns.$inferInsert, "startDate" | "endDate">> & {
      startDate?: Date;
      endDate?: Date;
      updatedAt: Date;
    } = {
      ...restData,
      updatedAt: new Date(),
    };

    if (startDate) {
      updateData.startDate = new Date(startDate);
    }
    if (endDate) {
      updateData.endDate = new Date(endDate);
    }

    const [updatedCampaign] = await db
      .update(campaigns)
      .set(updateData)
      .where(and(eq(campaigns.tenantId, tenantId), eq(campaigns.id, campaignId)))
      .returning();

    if (!updatedCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; campaignId: string }> }
) {
  try {
    const { id: tenantId, campaignId } = await params;
    const { orgId, orgRole } = await auth();

    if (!orgId || orgId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const [deletedCampaign] = await db
      .delete(campaigns)
      .where(and(eq(campaigns.tenantId, tenantId), eq(campaigns.id, campaignId)))
      .returning();

    if (!deletedCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
