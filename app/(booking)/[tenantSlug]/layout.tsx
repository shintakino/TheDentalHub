import { mockDb } from "@/lib/db/mock-db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function BookingLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const clinic = await mockDb.getClinicBySubdomain(tenantSlug);

  if (!clinic) {
    notFound();
  }

  const brandStyles = {
    "--brand-primary": clinic.primaryColor || "#0047FF",
    "--brand-secondary": `${clinic.primaryColor}10` || "#F1F5F9",
  } as React.CSSProperties;

  return (
    <div style={brandStyles} className="min-h-screen bg-[#FAFAFA]">
      <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay pointer-events-none" />
      
      <header className="h-20 border-b flex items-center px-6 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href={`/${tenantSlug}/book`} className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-serif text-xl font-bold"
              style={{ backgroundColor: clinic.primaryColor }}
            >
              {clinic.logoUrl ? (
                <img src={clinic.logoUrl} alt={clinic.name} className="h-full w-full object-cover rounded-lg" />
              ) : (
                clinic.name.charAt(0)
              )}
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#0A1120]">
              {clinic.name}
            </span>
          </Link>
          <div className="hidden sm:block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Patient Booking Portal
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-12 px-4 relative z-10">
        {children}
      </main>
      
      <footer className="border-t py-12 bg-white/50 relative z-10">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
            &copy; {new Date().getFullYear()} {clinic.name}. All rights reserved.
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 font-bold">
            Powered by The Dental Hub
          </p>
        </div>
      </footer>
    </div>
  );
}
