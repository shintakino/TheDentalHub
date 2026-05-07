import { db } from "@/lib/db";
import { appointments, auditLogs } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getTenantId } from "@/lib/db/tenant";
import { DailySchedule } from "@/components/dashboard/DailySchedule";
import { WaitlistManager } from "@/components/dashboard/WaitlistManager";
import { LivePulse } from "@/components/dashboard/LivePulse";
import { KPISnapshot, QuickActions, ActivityFeed, Activity, ActivityStatusPayload } from "@/components/dashboard/OverviewComponents";
import { startOfDay, endOfDay } from "date-fns";
import { getNetworkRecommendations } from "@/lib/analytics/optimization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardPage({
  params,
  searchParams
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ branchId?: string }>;
}) {
  const { tenantSlug } = await params;
  const { branchId } = await searchParams;
  const tenantId = await getTenantId();

  // Fetch today's appointments for this tenant
  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  const baseConditions = [
    eq(appointments.tenantId, tenantId),
    gte(appointments.startTime, start),
    lte(appointments.startTime, end)
  ];

  if (branchId) {
    baseConditions.push(eq(appointments.branchId, branchId));
  }

  const dailyAppointments = await db.query.appointments.findMany({
    where: and(...baseConditions),
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
  const activityConditions = [eq(auditLogs.tenantId, tenantId)];
  // Note: auditLogs doesn't have branchId directly, but we could filter by appointment.branchId if we join
  // For now, let's keep activity feed global or filtered if we want to be strict.
  
  const recentLogs = await db.query.auditLogs.findMany({
    where: and(...activityConditions),
    limit: 5,
    orderBy: [desc(auditLogs.createdAt)],
    with: {
      appointment: true
    }
  });

  // Filter logs if branchId is provided (post-fetch since auditLogs doesn't have branchId)
  const filteredLogs = branchId 
    ? recentLogs.filter(log => log.appointment?.branchId === branchId)
    : recentLogs;

  // Fetch Recommendations (only on "All Branches" view or always?)
  // Spec says: "Intelligence Alerts: 'System Recommendations' section on the Overview page"
  const recommendations = !branchId ? await getNetworkRecommendations(tenantId) : [];

  // Map to the format expected by DailySchedule component
  const formattedAppointments = dailyAppointments.map((app) => ({
    id: app.id,
    patientName: app.patientName,
    startTime: app.startTime.toISOString(),
    status: app.status,
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
          <h1 className="font-playfair text-5xl font-bold text-obsidian">Command Center</h1>
          <p className="text-slate-500 font-outfit text-lg">
            {branchId ? "Local branch operational heartbeat." : "Your clinic's daily operational heartbeat."}
          </p>
        </div>
        <WaitlistManager />
      </div>

      {!branchId && recommendations.length > 0 && (
        <div className="mb-12">
          <Card className="border-none shadow-[0_4px_32px_rgba(255,107,0,0.1)] bg-amber-50/30 overflow-hidden">
            <CardHeader className="bg-amber-50/50 pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                <CardTitle className="font-playfair text-xl text-amber-900">Intelligence Recommendations</CardTitle>
              </div>
              <Badge variant="outline" className="bg-white/50">{recommendations.length} new</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-amber-100">
                {recommendations.slice(0, 2).map((rec, i) => (
                  <div key={i} className="p-6 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={rec.priority === "high" ? "destructive" : "secondary"} className="uppercase text-[10px] tracking-widest">
                          {rec.priority} priority
                        </Badge>
                        <h4 className="font-outfit font-semibold text-amber-900">{rec.title}</h4>
                      </div>
                      <p className="text-amber-800/70 text-sm">{rec.description}</p>
                    </div>
                    {rec.action && (
                      <Button variant="outline" size="sm" className="shrink-0 border-amber-200 text-amber-700 hover:bg-amber-100">
                        {rec.action} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
