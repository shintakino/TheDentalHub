import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clinics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";

export default async function TenantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const resolvedParams = await params;
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // If they have an active org but are trying to access a different one, redirect to theirs
  if (orgId && orgId !== resolvedParams.tenantSlug) {
    redirect(`/manage/${orgId}/overview`);
  }

  // If they have NO active org, they shouldn't be here (unless they are super admin, but that's different flow)
  if (!orgId) {
    redirect("/onboarding/clinic");
  }

  // Check if clinic exists in our DB
  const clinicRecords = await db
    .select()
    .from(clinics)
    .where(eq(clinics.tenantId, orgId))
    .limit(1);

  if (clinicRecords.length === 0) {
    // Provisioning state (Race condition handler)
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h2 className="text-2xl font-serif font-bold">Provisioning your workspace...</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          We're finalizing your clinic setup. This page will automatically refresh in a moment.
        </p>
        {/* Meta refresh as a simple way to handle the wait without complex client-side polling for now */}
        <meta httpEquiv="refresh" content="3" />
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}
