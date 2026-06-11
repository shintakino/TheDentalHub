import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CampaignManager } from "@/components/dashboard/CampaignManager";
import { db } from "@/lib/db";
import { clinics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  if (orgId !== tenantSlug) {
    redirect("/sign-in");
  }

  if (orgRole !== "org:admin") {
    redirect(`/manage/${tenantSlug}/overview`);
  }

  // Find the clinic by tenantId (tenantSlug) to get the correct clinic
  const clinic = await db.query.clinics.findFirst({
    where: eq(clinics.tenantId, tenantSlug),
  });

  if (!clinic) {
    redirect(`/manage/${tenantSlug}/overview`);
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-8">
      <CampaignManager tenantId={clinic.tenantId} />
    </div>
  );
}
