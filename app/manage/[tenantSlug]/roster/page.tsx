import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StaffRoster } from "@/components/dashboard/StaffRoster";

export default async function RosterPage({
  params,
  searchParams
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ branchId?: string }>;
}) {
  const { tenantSlug } = await params;
  const { branchId } = await searchParams;
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId || orgId !== tenantSlug) {
    redirect("/sign-in");
  }

  const isAdmin = orgRole === "org:admin";

  return (
    <div className="max-w-7xl mx-auto py-12 px-8">
      <StaffRoster tenantId={tenantSlug} branchId={branchId} isAdmin={isAdmin} />
    </div>
  );
}
