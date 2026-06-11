import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const whereClause = orgId 
      ? and(eq(notifications.tenantId, orgId), eq(notifications.userId, userId))
      : eq(notifications.userId, userId);

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(50); // Fetch latest 50 notifications

    return NextResponse.json(userNotifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      const whereClause = orgId 
        ? and(eq(notifications.tenantId, orgId), eq(notifications.userId, userId), eq(notifications.isRead, false))
        : and(eq(notifications.userId, userId), eq(notifications.isRead, false));
        
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(whereClause);
    } else if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      const whereClause = orgId 
        ? and(eq(notifications.tenantId, orgId), eq(notifications.userId, userId), inArray(notifications.id, notificationIds))
        : and(eq(notifications.userId, userId), inArray(notifications.id, notificationIds));
        
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(whereClause);
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
