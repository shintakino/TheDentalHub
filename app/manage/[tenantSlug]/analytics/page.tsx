import { getAnalyticsOverview } from "@/lib/analytics/queries";
import { getTenantId } from "@/lib/db/tenant";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { NetworkHeatmap } from "@/components/dashboard/NetworkHeatmap";
import { format, subDays } from "date-fns";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const tenantId = await getTenantId();
  const resolvedParams = await searchParams;
  
  const endDate = resolvedParams.endDate || format(new Date(), "yyyy-MM-dd");
  const startDate = resolvedParams.startDate || format(subDays(new Date(), 30), "yyyy-MM-dd");

  const data = await getAnalyticsOverview(tenantId, startDate, endDate);

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-4xl font-playfair font-semibold text-obsidian">Network Intelligence</h1>
        <p className="text-slate-500 font-outfit text-lg">Cross-branch performance & demand density</p>
      </div>
      
      <AnalyticsOverview data={data} />

      <div className="pt-4">
        <NetworkHeatmap />
      </div>
    </div>
  );
}
