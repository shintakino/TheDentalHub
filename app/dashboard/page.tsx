import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { getTenantId } from "@/lib/db/tenant";
import { DailySchedule } from "@/components/dashboard/DailySchedule";
import { startOfDay, endOfDay } from "date-fns";

export default async function DashboardPage() {
  const tenantId = await getTenantId();

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

  // Map to the format expected by DailySchedule component
  const formattedAppointments = dailyAppointments.map((app) => ({
    id: app.id,
    patientName: app.patientName,
    startTime: app.startTime.toISOString(),
    status: app.status,
  }));

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-10">
        <h1 className="font-playfair text-4xl font-bold text-obsidian mb-2">Welcome Back</h1>
        <p className="text-slate-500 font-outfit">Manage your clinic's flow and patient appointments from here.</p>
      </div>
      
      <DailySchedule initialAppointments={formattedAppointments} />
    </div>
  );
}
