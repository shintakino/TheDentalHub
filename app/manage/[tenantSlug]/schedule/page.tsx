import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { getTenantId } from "@/lib/db/tenant";
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  startOfDay, 
  endOfDay,
  addWeeks,
  subWeeks
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";

export default async function SchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { tenantSlug } = await params;
  const { date } = await searchParams;
  const tenantId = await getTenantId();

  const selectedDate = date ? new Date(date) : new Date();
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const weekAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.tenantId, tenantId),
      gte(appointments.startTime, startOfDay(start)),
      lte(appointments.startTime, endOfDay(end))
    ),
    orderBy: [appointments.startTime],
  });

  const prevWeek = format(subWeeks(selectedDate, 1), "yyyy-MM-dd");
  const nextWeek = format(addWeeks(selectedDate, 1), "yyyy-MM-dd");

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
            <Link href={`/manage/${tenantSlug}/schedule?date=${prevWeek}`}>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="px-4 font-outfit font-medium text-obsidian min-w-[200px] text-center">
            {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/manage/${tenantSlug}/schedule?date=${nextWeek}`}>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {days.map((day) => {
          const dayAppointments = weekAppointments.filter((app) => isSameDay(app.startTime, day));
          const isToday = isSameDay(day, new Date());

          return (
            <div key={day.toString()} className="flex flex-col gap-4">
              <div className={cn(
                "flex flex-col items-center py-4 rounded-2xl transition-all",
                isToday ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-400 border border-slate-100"
              )}>
                <span className="text-xs font-outfit uppercase tracking-wider font-bold mb-1">
                  {format(day, "EEE")}
                </span>
                <span className="text-2xl font-serif font-bold">
                  {format(day, "d")}
                </span>
              </div>

              <div className="space-y-3">
                {dayAppointments.length === 0 ? (
                  <div className="h-32 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300 text-xs font-outfit text-center p-4">
                    No appointments
                  </div>
                ) : (
                  dayAppointments.map((app) => (
                    <div 
                      key={app.id} 
                      className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-shadow group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3 h-3 text-primary" />
                        <span className="text-[11px] font-bold font-outfit text-primary uppercase">
                          {format(app.startTime, "h:mm a")}
                        </span>
                      </div>
                      <div className="font-outfit font-semibold text-obsidian text-sm truncate group-hover:text-primary transition-colors">
                        {app.patientName}
                      </div>
                      <div className="mt-2">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight",
                          app.status === 'confirmed' && "bg-emerald-50 text-emerald-600",
                          app.status === 'checked_in' && "bg-blue-50 text-blue-600",
                          app.status === 'in_progress' && "bg-purple-50 text-purple-600",
                          app.status === 'completed' && "bg-slate-50 text-slate-600",
                          app.status === 'cancelled' && "bg-red-50 text-red-600",
                          app.status === 'no_show' && "bg-amber-50 text-amber-600",
                        )}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
