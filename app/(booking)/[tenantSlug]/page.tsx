import { db } from "@/lib/db";
import { clinics, branches, services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Clock, Star, ShieldCheck } from "lucide-react";

export default async function ClinicLandingPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;

  const clinic = await db.query.clinics.findFirst({
    where: eq(clinics.subdomain, tenantSlug),
  });

  if (!clinic) notFound();

  const [allBranches, allServices] = await Promise.all([
    db.query.branches.findMany({
      where: eq(branches.tenantId, clinic.tenantId),
    }),
    db.query.services.findMany({
      where: eq(services.tenantId, clinic.tenantId),
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[40px] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-60" />
        <div className="relative grid md:grid-cols-2 gap-12 p-8 md:p-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase">
              <Star className="w-3 h-3 fill-primary" />
              Top Rated Clinic
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-[#0A1120] leading-[1.1]">
              {clinic.name}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              Precision dentistry meets elite patient care. Experience the standard of excellence in oral health.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="h-14 px-8 rounded-2xl bg-primary hover:opacity-90 shadow-xl shadow-primary/20 text-lg font-bold">
                <Link href={`/${tenantSlug}/book`}>
                  Book Appointment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-slate-200 text-lg font-bold">
                View Services
              </Button>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative aspect-square rounded-[32px] overflow-hidden bg-slate-100 border-8 border-white shadow-2xl">
              {clinic.logoUrl ? (
                <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white font-serif text-9xl font-bold">
                  {clinic.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Our Specialties</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From preventive care to advanced restorative treatments, we offer a comprehensive range of dental services tailored to your needs.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {allServices.map((service) => (
            <div key={service.id} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{service.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">Expert clinical care with a focus on patient comfort and long-term results.</p>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 py-1 px-3 rounded-full">
                  {service.duration} mins
                </span>
                <Link href={`/${tenantSlug}/book?serviceId=${service.id}`} className="text-sm font-bold text-[#0A1120] hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Book <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Locations */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Where to find us</h2>
          <div className="space-y-6">
            {allBranches.map((branch) => (
              <div key={branch.id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{branch.name}</h4>
                    <p className="text-muted-foreground text-sm">{branch.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">Operating Hours</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {branch.operatingHours.filter(h => h.active).map(h => (
                        <div key={h.day} className="text-xs flex justify-between bg-slate-50 p-2 rounded-lg">
                          <span className="text-muted-foreground font-medium">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][h.day]}
                          </span>
                          <span className="font-bold">{h.open} - {h.close}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[40px] overflow-hidden aspect-video bg-slate-200 shadow-2xl relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-50" />
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl text-center max-w-xs">
              <MapPin className="w-10 h-10 text-primary mx-auto mb-4" />
              <p className="font-bold">Our clinics are located in prime locations for your convenience.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
