import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InventoryManager } from "@/components/dashboard/InventoryManager";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { userId, orgId } = await auth();

  if (!userId || !orgId || orgId !== tenantSlug) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-8">
      <InventoryManager tenantId={tenantSlug} />
    </div>
  );
}
