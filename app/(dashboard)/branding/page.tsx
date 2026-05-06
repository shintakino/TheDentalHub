import { Suspense } from "react";
import { getTenantId } from "@/lib/db/tenant";
import { db } from "@/lib/db";
import { clinics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IdentityTab } from "@/components/dashboard/branding/IdentityTab";
import { AppearanceTab } from "@/components/dashboard/branding/AppearanceTab";
import { PresenceTab } from "@/components/dashboard/branding/PresenceTab";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Branding | The Dental Hub",
  description: "Manage your clinic's brand identity and appearance.",
};

async function BrandingContent() {
  const tenantId = await getTenantId();
  const clinic = await db.query.clinics.findFirst({
    where: eq(clinics.tenantId, tenantId),
  });

  if (!clinic) {
    return <div>Clinic not found.</div>;
  }

  // Ensure primaryColor has a default if null in DB (shouldn't be based on schema default)
  const clinicWithDefaults = {
    ...clinic,
    primaryColor: clinic.primaryColor || "#0047FF",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Clinic Branding</h1>
        <p className="text-muted-foreground">
          Customize how your clinic appears to patients on the booking page.
        </p>
      </div>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="presence">Presence</TabsTrigger>
        </TabsList>
        
        <TabsContent value="identity" className="space-y-6">
          <IdentityTab clinic={clinicWithDefaults} />
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6">
          <AppearanceTab clinic={clinicWithDefaults} />
        </TabsContent>
        
        <TabsContent value="presence" className="space-y-6">
          <PresenceTab clinic={clinicWithDefaults} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BrandingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-10 w-[400px]" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function BrandingPage() {
  return (
    <div className="container py-8 max-w-5xl">
      <Suspense fallback={<BrandingSkeleton />}>
        <BrandingContent />
      </Suspense>
    </div>
  );
}
