import { SignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { clinics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function BrandedSignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { tenantSlug } = await params;
  const { redirect_url } = await searchParams;
  const clinic = await db.query.clinics.findFirst({
    where: eq(clinics.subdomain, tenantSlug),
  });

  if (!clinic) notFound();

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Welcome to {clinic.name}</h1>
        <p className="text-muted-foreground">Sign in to manage your appointments and complete your booking.</p>
      </div>
      
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:opacity-90 transition-opacity text-sm font-bold uppercase tracking-widest py-3",
            card: "shadow-2xl border-none rounded-3xl p-4",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton: "rounded-xl border-slate-200 hover:bg-slate-50 transition-colors",
            formFieldInput: "rounded-xl border-slate-200 focus:ring-primary focus:border-primary",
            footerActionLink: "text-primary hover:text-primary/80 font-bold",
          },
          variables: {
            colorPrimary: clinic.primaryColor || "#0047FF",
          }
        }}
        signUpUrl={`/${tenantSlug}/sign-up`}
        forceRedirectUrl={redirect_url || `/${tenantSlug}/book`}
      />
    </div>
  );
}
