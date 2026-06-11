import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InventoryManager } from "@/components/dashboard/InventoryManager";
import { getBranchBySlug } from "@/lib/db/branch";

export default async function BranchInventoryPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; branchSlug: string }>;
}) {
  const { tenantSlug, branchSlug } = await params;
  const { userId, orgId } = await auth();

  if (!userId || !orgId || orgId !== tenantSlug) {
    redirect("/sign-in");
  }

  // Resolve branchSlug to branchId
  const branch = await getBranchBySlug(tenantSlug, branchSlug);
  if (!branch) {
    redirect(`/manage/${tenantSlug}/overview`);
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-8">
      <InventoryManager tenantId={tenantSlug} branchId={branch.id} />
    </div>
  );
}
