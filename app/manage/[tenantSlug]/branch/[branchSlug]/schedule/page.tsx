import { db } from "@/lib/db";
import { appointments, branches, services } from "@/lib/db/schema";
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
import { getBranchBySlug } from "@/lib/db/branch";
import { redirect } from "next/navigation";

export default async function BranchSchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string; branchSlug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { tenantSlug, branchSlug } = await params;
  const { date } = await searchParams;
  const tenantId = await getTenantId();

  const branch = await getBranchBySlug(tenantSlug, branchSlug);
  if (!branch) {
    redirect(`/manage/${tenantSlug}/overview`);
  }

  const branchId = branch.id;

  const selectedDate = date ? new Date(date) : new Date();
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const conditions = [
    eq(appointments.tenantId, tenantId),
    eq(appointments.branchId, branchId),
    gte(appointments.startTime, startOfDay(start)),
    lte(appointments.startTime, endOfDay(end))
  ];

  const weekAppointments = await db
    .select({
      id: appointments.id,
      patientName: appointments.patientName,
      patientEmail: appointments.patientEmail,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      status: appointments.status,
      riskScore: appointments.riskScore,
      branchName: branches.name,
      serviceName: services.name,
      duration: services.duration,
    })
    .from(appointments)
    .leftJoin(branches, eq(appointments.branchId, branches.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(and(...conditions))
    .orderBy(appointments.startTime);

  const formattedAppointments = weekAppointments.map((app) => ({
    id: app.id,
    patientName: app.patientName,
    patientEmail: app.patientEmail,
    startTime: app.startTime.toISOString(),
    endTime: app.endTime.toISOString(),
    status: app.status,
    riskScore: app.riskScore,
    branchName: app.branchName || "Unknown Branch",
    serviceName: app.serviceName || "Unknown Service",
    duration: app.duration || 0,
  }));

  const prevWeek = format(subWeeks(selectedDate, 1), "yyyy-MM-dd");
  const nextWeek = format(addWeeks(selectedDate, 1), "yyyy-MM-dd");

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-playfair font-semibold text-obsidian">{branch.name} Schedule</h1>
          <p className="text-slate-500 font-outfit text-lg">
            Weekly view of patient appointments for this branch.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-100 p-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/manage/${tenantSlug}/branch/${branchSlug}/schedule?date=${prevWeek}`}>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="px-4 font-outfit font-medium text-obsidian min-w-[200px] text-center">
            {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/manage/${tenantSlug}/branch/${branchSlug}/schedule?date=${nextWeek}`}>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <WeeklyScheduleView days={days} initialAppointments={formattedAppointments} />
    </div>
  );
}
