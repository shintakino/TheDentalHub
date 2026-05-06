import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, communicationsLog } from "@/lib/db/schema";
import { eq, and, gt, lt, notExists } from "drizzle-orm";
import { addHours, subHours } from "date-fns";
import { notificationTriggers } from "@/lib/notifications/triggers";

export async function GET(req: Request) {
  // Simple API key check for "cron" (In a real app, use a more secure header or Vercel's secret)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const windowStart = addHours(now, 23);
    const windowEnd = addHours(now, 25);

    // Find appointments in the 23-25 hour window that haven't had a reminder sent yet
    const upcomingAppointments = await db.query.appointments.findMany({
      where: and(
        eq(appointments.status, "confirmed"),
        gt(appointments.startTime, windowStart),
        lt(appointments.startTime, windowEnd),
        // Anti-duplicate check
        notExists(
          db.select()
            .from(communicationsLog)
            .where(
              and(
                eq(communicationsLog.appointmentId, appointments.id),
                eq(communicationsLog.templateName, "AppointmentReminder"),
                eq(communicationsLog.status, "sent")
              )
            )
        )
      ),
    });

    const results = await Promise.allSettled(
      upcomingAppointments.map((app) => 
        notificationTriggers.triggerAppointmentReminder(app.id)
      )
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      processed: upcomingAppointments.length,
      successful,
      failed,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
