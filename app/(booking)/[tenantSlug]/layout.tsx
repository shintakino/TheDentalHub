import { db } from "@/lib/db";
import { clinics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function BookingLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { tenantSlug: string };
}) {
  const clinic = await db.query.clinics.findFirst({
    where: eq(clinics.subdomain, params.tenantSlug)
  });

  if (!clinic) {
    notFound();
  }

  const brandStyles = {
    "--brand-primary": clinic.primaryColor || "#0047FF",
    "--brand-secondary": clinic.secondaryColor || "#F1F5F9",
  } as React.CSSProperties;

  return (
    <div style={brandStyles} className="min-h-screen bg-background">
      <header className="h-16 border-b flex items-center px-6 bg-card sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {clinic.logoUrl ? (
              <img src={clinic.logoUrl} alt={clinic.name} className="h-8 w-auto object-contain" />
            ) : (
              <span className="font-serif text-xl font-bold tracking-tight text-brand-primary">
                {clinic.name}
              </span>
            )}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Patient Booking Portal
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {clinic.name}. Powered by The Dental Hub.
          </p>
        </div>
      </footer>
    </div>
  );
}
