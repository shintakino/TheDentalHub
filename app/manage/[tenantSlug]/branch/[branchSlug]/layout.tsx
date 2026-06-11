import { redirect } from "next/navigation";
import { getBranchBySlug } from "@/lib/db/branch";

export default async function BranchWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string; branchSlug: string }>;
}) {
  const { tenantSlug, branchSlug } = await params;

  // Resolve and validate branch slug
  const branch = await getBranchBySlug(tenantSlug, branchSlug);
  if (!branch) {
    // If branch doesn't exist, redirect to HQ overview
    redirect(`/manage/${tenantSlug}/overview`);
  }

  return <>{children}</>;
}
