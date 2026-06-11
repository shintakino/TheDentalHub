import { db } from "@/lib/db";
import { appointments, auditLogs, inventoryItems, branches, services } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getTenantId } from "@/lib/db/tenant";
import { DailySchedule } from "@/components/dashboard/DailySchedule";
import { WaitlistManager } from "@/components/dashboard/WaitlistManager";
import { LivePulse } from "@/components/dashboard/LivePulse";
import { LowStockWidget, KPISnapshot, QuickActions, ActivityFeed, Activity, ActivityStatusPayload } from "@/components/dashboard/OverviewComponents";
import { startOfDay, endOfDay } from "date-fns";
import { getBranchBySlug } from "@/lib/db/branch";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function BranchOverviewPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; branchSlug: string }>;
}) {
  const { tenantSlug, branchSlug } = await params;
  const tenantId = await getTenantId();
  const { orgRole } = await auth();
  const isAdmin = orgRole === "org:admin";

  const branch = await getBranchBySlug(tenantSlug, branchSlug);
  if (!branch) {
    redirect(`/manage/${tenantSlug}/overview`);
  }

  const branchId = branch.id;

  // Fetch today's appointments for this branch
  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  const baseConditions = [
    eq(appointments.tenantId, tenantId),
    eq(appointments.branchId, branchId),
    gte(appointments.startTime, start),
    lte(appointments.startTime, end)
  ];

  const dailyAppointments = await db
    .select({
      id: appointments.id,
      patientName: appointments.patientName,
      patientEmail: appointments.patientEmail,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      status: appointments.status,
      riskScore: appointments.riskScore,
      branch: {
        name: branches.name,
      },
      service: {
        name: services.name,
        duration: services.duration,
      },
    })
    .from(appointments)
    .innerJoin(branches, eq(branches.id, appointments.branchId))
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .where(and(...baseConditions))
    .orderBy(appointments.startTime);

  // Calculate KPIs
  const stats = {
    total: dailyAppointments.length,
    checkedIn: dailyAppointments.filter(a => a.status === 'checked_in' || a.status === 'in_progress' || a.status === 'completed').length,
    pending: dailyAppointments.filter(a => a.status === 'pending_approval').length,
    noShow: dailyAppointments.filter(a => a.status === 'no_show').length,
    cancelled: dailyAppointments.filter(a => a.status === 'cancelled').length,
  };

  // Fetch Recent Activity for this branch
  const recentLogsConditions = [
    eq(auditLogs.tenantId, tenantId),
    eq(appointments.branchId, branchId)
  ];

  const filteredLogs = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      payload: auditLogs.payload,
      createdAt: auditLogs.createdAt,
      appointment: {
        patientName: appointments.patientName,
        branchId: appointments.branchId,
      },
    })
    .from(auditLogs)
    .leftJoin(appointments, eq(appointments.id, auditLogs.appointmentId))
    .where(and(...recentLogsConditions))
    .limit(5)
    .orderBy(desc(auditLogs.createdAt));

  // Fetch Low Stock Items for this branch
  const inventoryData = await db.query.inventoryItems.findMany({
    where: eq(inventoryItems.tenantId, tenantId),
    with: {
      stock: {
        where: eq(branches.id, branchId)
      }
    }
  });

  const lowStockItems = inventoryData.filter(item => {
    return item.stock.some(s => s.branchId === branchId && Number(s.quantity) <= Number(s.lowStockThreshold));
  });

  // Map to the format expected by DailySchedule component
  const formattedAppointments = dailyAppointments.map((app) => ({
    id: app.id,
    patientName: app.patientName,
    patientEmail: app.patientEmail,
    startTime: app.startTime.toISOString(),
    endTime: app.endTime.toISOString(),
    status: app.status,
    riskScore: app.riskScore,
    branchName: app.branch.name,
    serviceName: app.service.name,
    duration: app.service.duration,
  }));

  const formattedActivities: Activity[] = filteredLogs.map(log => ({
    id: log.id,
    action: log.action,
    patientName: log.appointment?.patientName,
    timestamp: log.createdAt,
    payload: log.payload as ActivityStatusPayload | null,
  }));

  return (
    <div className="max-w-7xl mx-auto py-12 px-8">
      <div className="flex justify-between items-start mb-12">
        <div className="space-y-2">
          <h1 className="font-playfair text-5xl font-bold text-obsidian">{branch.name}</h1>
          <p className="text-slate-500 font-outfit text-lg">
            Local branch operational heartbeat.
          </p>
        </div>
        <WaitlistManager branchId={branchId} />
      </div>

      <QuickActions tenantSlug={tenantSlug} isAdmin={isAdmin} />
      
      {lowStockItems.length > 0 && (
        <LowStockWidget items={lowStockItems} tenantSlug={tenantSlug} />
      )}

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
