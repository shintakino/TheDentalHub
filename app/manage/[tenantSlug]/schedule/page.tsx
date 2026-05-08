import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { getTenantId } from "@/lib/db/tenant";
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  startOfDay, 
  endOfDay,
  addWeeks,
  subWeeks
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { WeeklyScheduleView } from "@/components/dashboard/WeeklyScheduleView";

export default async function SchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ date?: string; branchId?: string }>;
}) {
  const { tenantSlug } = await params;
  const { date, branchId } = await searchParams;
  const tenantId = await getTenantId();

  const selectedDate = date ? new Date(date) : new Date();
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const conditions = [
    eq(appointments.tenantId, tenantId),
    gte(appointments.startTime, startOfDay(start)),
    lte(appointments.startTime, endOfDay(end))
  ];

  if (branchId) {
    conditions.push(eq(appointments.branchId, branchId));
  }

  const weekAppointments = await db.query.appointments.findMany({
    where: and(...conditions),
    orderBy: [appointments.startTime],
    with: {
      branch: true,
      service: true,
    }
  });

  const formattedAppointments = weekAppointments.map((app) => ({
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

  const prevWeek = format(subWeeks(selectedDate, 1), "yyyy-MM-dd");
  const nextWeek = format(addWeeks(selectedDate, 1), "yyyy-MM-dd");
  const branchParam = branchId ? `&branchId=${branchId}` : "";

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-playfair font-semibold text-obsidian">Clinical Schedule</h1>
          <p className="text-slate-500 font-outfit text-lg">
            Weekly view of all patient appointments.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-100 p-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/manage/${tenantSlug}/schedule?date=${prevWeek}${branchParam}`}>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="px-4 font-outfit font-medium text-obsidian min-w-[200px] text-center">
            {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/manage/${tenantSlug}/schedule?date=${nextWeek}${branchParam}`}>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <WeeklyScheduleView days={days} initialAppointments={formattedAppointments} />
    </div>
  );
}
