import { mockDb } from "@/lib/db/mock-db";
import { notFound } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ 
    step?: string; 
    serviceId?: string; 
    branchId?: string; 
    date?: string; 
    time?: string;
  }>;
}) {
  const { tenantSlug } = await params;
  const { step = "1", serviceId, branchId, date, time } = await searchParams;
  const { userId } = await auth();

  const clinic = await mockDb.getClinicBySubdomain(tenantSlug);
  if (!clinic) notFound();

  // Fetch data for steps
  const allServices = [
    { id: "s1", name: "General Consultation", duration: 30, description: "Routine check-up and cleaning" },
    { id: "s2", name: "Teeth Whitening", duration: 60, description: "Professional whitening treatment" },
    { id: "s3", name: "Dental Emergency", duration: 45, description: "Immediate care for urgent issues" },
  ];
  
  const branches = await mockDb.getBranches(clinic.tenantId);
  const selectedService = allServices.find(s => s.id === serviceId);
  const selectedBranch = branches.find(b => b.id === branchId);

  const steps = [
    { n: "1", name: "Service" },
    { n: "2", name: "Branch" },
    { n: "3", name: "Time" },
    { n: "4", name: "Review" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Wizard Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-[#0A1120]">
          Schedule Your Visit
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Experience world-class dental care. Select your service and find a time that works for you.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-4 flex-1 last:flex-none">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500
              ${step === s.n ? 'border-primary bg-primary text-white scale-110 shadow-lg' : 
                parseInt(step) > i + 1 ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-400'}
            `}>
              {parseInt(step) > i + 1 ? '✓' : s.n}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 rounded-full ${parseInt(step) > i + 1 ? 'bg-primary' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-200/50 min-h-[500px] flex flex-col">
        {step === "1" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold">Select a Service</h2>
              <p className="text-muted-foreground">What can we help you with today?</p>
            </div>
            <div className="grid gap-4">
              {allServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/${tenantSlug}?step=2&serviceId=${service.id}`}
                  className="group p-6 rounded-2xl border bg-card hover:border-primary hover:shadow-lg transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold uppercase tracking-widest text-[10px]">
                      {service.duration} min
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {step === "2" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold">Choose a Location</h2>
              <p className="text-muted-foreground">Select the branch most convenient for you.</p>
            </div>
            <div className="grid gap-4">
              {branches.map((branch) => (
                <Link
                  key={branch.id}
                  href={`/${tenantSlug}?step=3&serviceId=${serviceId}&branchId=${branch.id}`}
                  className="group p-6 rounded-2xl border bg-card hover:border-primary hover:shadow-lg transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{branch.name}</h3>
                    <p className="text-sm text-muted-foreground">{branch.address}</p>
                  </div>
                  <div className="shrink-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </Link>
              ))}
            </div>
            <Link href={`/${tenantSlug}?step=1`} className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest gap-2">
              ← Back to services
            </Link>
          </div>
        )}

        {step === "3" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold">Find a Time</h2>
              <p className="text-muted-foreground">Select a date and available time slot.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Calendar 
                  mode="single"
                  className="rounded-2xl border shadow-sm p-4 bg-white"
                  disabled={{ before: new Date() }}
                />
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Available Slots</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["09:00", "10:00", "11:30", "14:00", "15:30", "16:15"].map((t) => (
                      <Link
                        key={t}
                        href={`/${tenantSlug}?step=4&serviceId=${serviceId}&branchId=${branchId}&date=2026-05-10&time=${t}`}
                        className="p-3 rounded-xl border text-center font-bold text-sm hover:bg-primary hover:text-white hover:border-primary transition-all"
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Link href={`/${tenantSlug}?step=2&serviceId=${serviceId}`} className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest gap-2">
              ← Back to locations
            </Link>
          </div>
        )}

        {step === "4" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold">Review Your Booking</h2>
              <p className="text-muted-foreground">Please confirm your appointment details.</p>
            </div>
            
            <div className="grid gap-6 p-8 rounded-3xl bg-slate-50 border border-slate-100 flex-1">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Service</p>
                  <p className="text-lg font-bold">{selectedService?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedService?.duration} min</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Location</p>
                  <p className="text-lg font-bold">{selectedBranch?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedBranch?.address}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Date</p>
                  <p className="text-lg font-bold">May 10, 2026</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Time</p>
                  <p className="text-lg font-bold">{time}</p>
                </div>
              </div>
            </div>

            <div className="pt-8">
              {userId ? (
                <button 
                  className="w-full py-4 rounded-2xl bg-primary text-white text-lg font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  Confirm Appointment
                </button>
              ) : (
                <Link
                  href={`/${tenantSlug}/sign-in?redirect_url=/${tenantSlug}?step=4&serviceId=${serviceId}&branchId=${branchId}&date=2026-05-10&time=${time}`}
                  className="block w-full text-center py-4 rounded-2xl bg-primary text-white text-lg font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  Sign in to Complete Booking
                </Link>
              )}
              <p className="mt-4 text-center text-xs text-muted-foreground">
                By confirming, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
            
            <Link href={`/${tenantSlug}?step=3&serviceId=${serviceId}&branchId=${branchId}`} className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest gap-2">
              ← Back to times
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
