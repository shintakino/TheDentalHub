import { getAnalyticsOverview, getComparativeAnalytics } from "@/lib/analytics/queries";
import { getNetworkRecommendations } from "@/lib/analytics/optimization";
import { getTenantId } from "@/lib/db/tenant";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { NetworkHeatmap } from "@/components/dashboard/NetworkHeatmap";
import { format, subDays } from "date-fns";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string; branchId?: string }>;
}) {
  const tenantId = await getTenantId();
  const resolvedParams = await searchParams;
  
  const endDate = resolvedParams.endDate || format(new Date(), "yyyy-MM-dd");
  const startDate = resolvedParams.startDate || format(subDays(new Date(), 30), "yyyy-MM-dd");
  const branchId = resolvedParams.branchId;

  const [data, comparativeData, recommendations] = await Promise.all([
    getAnalyticsOverview(tenantId, startDate, endDate, branchId),
    getComparativeAnalytics(tenantId),
    getNetworkRecommendations(tenantId)
  ]);

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-4xl font-playfair font-semibold text-obsidian">Network Intelligence</h1>
        <p className="text-slate-500 font-outfit text-lg">Cross-branch performance & demand density</p>
      </div>
      
      <AnalyticsOverview 
        data={data} 
        comparativeData={!branchId ? comparativeData : undefined}
        recommendations={!branchId ? recommendations : undefined}
      />

      <div className="pt-4">
        <NetworkHeatmap />
      </div>
    </div>
  );
}
