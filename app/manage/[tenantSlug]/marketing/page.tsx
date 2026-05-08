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
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  // Find the clinic by subdomain/slug to get the correct tenantId
  const clinic = await db.query.clinics.findFirst({
    where: eq(clinics.subdomain, tenantSlug),
  });

  if (!clinic) {
    redirect("/manage/overview");
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-8">
      <CampaignManager tenantId={clinic.tenantId} />
    </div>
  );
}
