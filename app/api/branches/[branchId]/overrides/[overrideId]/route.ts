import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { branchOverrides } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ branchId: string; overrideId: string }> }
) {
  const { branchId, overrideId } = await params;
  const { orgId } = await auth();

  if (!orgId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await db.delete(branchOverrides).where(
      and(
        eq(branchOverrides.id, overrideId),
        eq(branchOverrides.branchId, branchId),
        eq(branchOverrides.tenantId, orgId)
      )
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[OVERRIDE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
