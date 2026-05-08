import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InventoryManager } from "@/components/dashboard/InventoryManager";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

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
    <div className="flex h-screen bg-background">
      <Sidebar tenantId={tenantSlug} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <InventoryManager tenantId={tenantSlug} />
        </main>
      </div>
    </div>
  );
}
