import { mockDb } from "@/lib/db/mock-db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ tenantSlug: string, id: string }>;
}) {
  const { tenantSlug, id } = await params;
  const clinic = await mockDb.getClinicBySubdomain(tenantSlug);
  if (!clinic) notFound();

  const appointment = await mockDb.getAppointmentById(id);
  if (!appointment) notFound();

  const branch = await mockDb.getBranchById(appointment.branchId);
  const service = await mockDb.getServiceById(appointment.serviceId);

  return (
    <div className="max-w-2xl mx-auto space-y-12 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <h1 className="text-4xl font-serif font-bold tracking-tight text-[#0A1120]">
          Booking Confirmed!
        </h1>
        <p className="text-lg text-muted-foreground">
          We've sent a confirmation email with all the details of your visit.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-200/50 space-y-8 border border-slate-50">
        <div className="grid gap-6">
          <div className="flex justify-between items-start pb-6 border-b border-slate-100">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-1">Service</p>
              <h3 className="text-xl font-bold">{service?.name}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-1">Status</p>
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Confirmed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 py-2">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-1">Date & Time</p>
              <p className="font-bold">{format(new Date(appointment.startTime), "PPP")}</p>
              <p className="text-sm font-medium text-slate-500">{format(new Date(appointment.startTime), "p")}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-1">Location</p>
              <p className="font-bold">{branch?.name}</p>
              <p className="text-xs font-medium text-slate-500">{branch?.address}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <button className="w-full py-4 rounded-2xl border-2 border-slate-100 font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Add to Calendar
          </button>
          
          <Link 
            href={`/${tenantSlug}/book`}
            className="block w-full text-center py-4 rounded-2xl bg-[#0A1120] text-white font-bold shadow-xl hover:opacity-90 transition-all"
          >
            Book Another Appointment
          </Link>
        </div>
      </div>

      <div className="text-center">
        <Link 
          href={`/dashboard/overview`}
          className="text-sm font-bold text-primary uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          View My Appointments →
        </Link>
      </div>
    </div>
  );
}
