import { db } from "@/lib/db";
import { appointments, staff, waitlistEntries, branches } from "@/lib/db/schema";
import { and, eq, gte, lte, sql, ne } from "drizzle-orm";
import { cache } from "react";

// ... (previous queries)

export const getNetworkHeatmap = cache(async (tenantId: string) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  return await db.select({
    branchId: appointments.branchId,
    timestamp: sql<string>`to_char(start_time, 'YYYY-MM-DD"T"HH24:00:00"Z"')`,
    density: sql<number>`count(*)::float / ${branches.maxCapacity}`.mapWith(Number),
    bookingCount: sql<number>`count(*)`.mapWith(Number),
    maxCapacity: branches.maxCapacity
  })
  .from(appointments)
  .innerJoin(branches, eq(branches.id, appointments.branchId))
  .where(
    and(
      eq(appointments.tenantId, tenantId),
      gte(appointments.startTime, start),
      lte(appointments.startTime, end),
      ne(appointments.status, "cancelled")
    )
  )
  .groupBy(appointments.branchId, sql`to_char(start_time, 'YYYY-MM-DD"T"HH24:00:00"Z"')`, branches.maxCapacity)
  .orderBy(sql`to_char(start_time, 'YYYY-MM-DD"T"HH24:00:00"Z"')`);
});

export const getAnalyticsOverview = cache(async (tenantId: string, startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // 1. Total Bookings (excluding cancelled)
  const [bookingsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.startTime, start),
        lte(appointments.startTime, end),
        ne(appointments.status, "cancelled")
      )
    );

  // 2. No-Show Rate
  const [noShowStats] = await db
    .select({
      total: sql<number>`count(*)`,
      noShows: sql<number>`count(*) filter (where status = 'no_show')`
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.startTime, start),
        lte(appointments.startTime, end)
      )
    );

  const noShowRate = noShowStats.total > 0 ? noShowStats.noShows / noShowStats.total : 0;

  // 3. Peak Hours
  const peakHours = await db
    .select({
      hour: sql<string>`to_char(start_time, 'HH24:00')`,
      count: sql<number>`count(*)`
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.startTime, start),
        lte(appointments.startTime, end)
      )
    )
    .groupBy(sql`to_char(start_time, 'HH24:00')`)
    .orderBy(sql`count(*) desc`);

  // 4. Staff Utilization
  const [totalBookedMinutes] = await db
    .select({
      minutes: sql<number>`sum(extract(epoch from (end_time - start_time)) / 60)`
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.startTime, start),
        lte(appointments.startTime, end),
        sql`status in ('confirmed', 'completed', 'in_progress', 'checked_in')`
      )
    );

  const staffList = await db.select().from(staff).where(eq(staff.tenantId, tenantId));
  const totalStaffTargetMinutes = staffList.reduce((acc, s) => acc + (s.targetDailyHours * 60), 0);
  
  // Calculate days in range
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
  const denominator = (totalStaffTargetMinutes * daysDiff) || 1;
  const avgUtilization = (totalBookedMinutes.minutes || 0) / denominator;

  // 5. Time Series (Daily)
  const timeSeries = await db
    .select({
      date: sql<string>`to_char(start_time, 'YYYY-MM-DD')`,
      bookings: sql<number>`count(*)`
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.startTime, start),
        lte(appointments.startTime, end),
        ne(appointments.status, "cancelled")
      )
    )
    .groupBy(sql`to_char(start_time, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(start_time, 'YYYY-MM-DD')`);

  // 6. Waitlist Stats
  const [waitlistStats] = await db
    .select({
      total: sql<number>`count(*)`,
      booked: sql<number>`count(*) filter (where status = 'booked')`
    })
    .from(waitlistEntries)
    .where(
      and(
        eq(waitlistEntries.tenantId, tenantId),
        gte(waitlistEntries.createdAt, start),
        lte(waitlistEntries.createdAt, end)
      )
    );

  const waitlistConversionRate = waitlistStats.total > 0 ? waitlistStats.booked / waitlistStats.total : 0;

  return {
    summary: {
      totalBookings: Number(bookingsCount.count),
      noShowRate,
      avgUtilization: Math.min(avgUtilization, 1), // Cap at 100%
      peakHour: peakHours[0]?.hour || "N/A",
      waitlistEntries: Number(waitlistStats.total),
      waitlistConversionRate,
    },
    timeSeries: timeSeries.map(t => ({
      date: t.date,
      bookings: Number(t.bookings),
      utilization: avgUtilization // Simplified for MVP: same avg across days
    })),
    peakHours: peakHours.map(p => ({
      hour: p.hour,
      count: Number(p.count)
    }))
  };
});
