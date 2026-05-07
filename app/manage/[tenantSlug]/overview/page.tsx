import { db } from "@/lib/db";
import { appointments, auditLogs } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getTenantId } from "@/lib/db/tenant";
import { DailySchedule } from "@/components/dashboard/DailySchedule";
import { WaitlistManager } from "@/components/dashboard/WaitlistManager";
import { LivePulse } from "@/components/dashboard/LivePulse";
import { KPISnapshot, QuickActions, ActivityFeed } from "@/components/dashboard/OverviewComponents";
import { startOfDay, endOfDay } from "date-fns";

export default async function DashboardPage({
  params
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const tenantId = await getTenantId();

  // ... (rest of data fetching)

  // Fetch today's appointments for this tenant
  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  const dailyAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.tenantId, tenantId),
      gte(appointments.startTime, start),
      lte(appointments.startTime, end)
    ),
    orderBy: [appointments.startTime],
  });

  // Calculate KPIs
  const stats = {
    total: dailyAppointments.length,
    checkedIn: dailyAppointments.filter(a => a.status === 'checked_in' || a.status === 'in_progress' || a.status === 'completed').length,
    noShow: dailyAppointments.filter(a => a.status === 'no_show').length,
    cancelled: dailyAppointments.filter(a => a.status === 'cancelled').length,
  };

  // Fetch Recent Activity
  const recentLogs = await db.query.auditLogs.findMany({
    where: eq(auditLogs.tenantId, tenantId),
    limit: 5,
    orderBy: [desc(auditLogs.createdAt)],
    with: {
      appointment: true
    }
  });

  // Map to the format expected by DailySchedule component
  const formattedAppointments = dailyAppointments.map((app) => ({
    id: app.id,
    patientName: app.patientName,
    startTime: app.startTime.toISOString(),
    status: app.status,
  }));

  const formattedActivities = recentLogs.map(log => ({
    id: log.id,
    action: log.action,
    patientName: log.appointment?.patientName,
    timestamp: log.createdAt,
    payload: log.payload,
  }));

  return (
    <div className="max-w-7xl mx-auto py-12 px-8">
      <div className="flex justify-between items-start mb-12">
        <div className="space-y-2">
          <h1 className="font-playfair text-5xl font-bold text-obsidian">Command Center</h1>
          <p className="text-slate-500 font-outfit text-lg">Your clinic&apos;s daily operational heartbeat.</p>
        </div>
        <WaitlistManager />
      </div>

      <QuickActions tenantSlug={tenantSlug} />
      
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6 font-playfair text-obsidian flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          Live Clinic Pulse
        </h2>
        <LivePulse />
      </div>
      
      <KPISnapshot stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DailySchedule initialAppointments={formattedAppointments} />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed activities={formattedActivities} />
        </div>
      </div>
    </div>
  );
}
