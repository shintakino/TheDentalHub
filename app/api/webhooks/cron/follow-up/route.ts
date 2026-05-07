import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, communicationsLog } from "@/lib/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";
import { notificationTriggers } from "@/lib/notifications/triggers";

export async function GET(request: Request) {
  // Authorization check (Vercel Cron Secret)
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find completed appointments from yesterday
  const appointmentsToFollowUp = await db.query.appointments.findMany({
    where: and(
      eq(appointments.status, "completed"),
      gte(appointments.updatedAt, yesterday),
      lt(appointments.updatedAt, today),
    ),
  });

  const processed = [];
  for (const appt of appointmentsToFollowUp) {
    // Check if feedback request was already sent
    const alreadySent = await db.query.communicationsLog.findFirst({
      where: and(
        eq(communicationsLog.appointmentId, appt.id),
        eq(communicationsLog.templateName, "FeedbackRequest")
      )
    });

    if (!alreadySent) {
      try {
        await notificationTriggers.triggerFeedbackRequest(appt.id);
        processed.push(appt.id);
      } catch (err) {
        console.error(`Failed to send feedback request for ${appt.id}:`, err);
      }
    }
  }

  return NextResponse.json({ 
    success: true, 
    found: appointmentsToFollowUp.length,
    processed: processed.length 
  });
}
