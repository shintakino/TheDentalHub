import { getRevenueAnalytics } from "@/lib/analytics/queries";
import { getTenantId } from "@/lib/db/tenant";
import { FinancialOverview } from "@/components/dashboard/FinancialOverview";
import { format, subDays } from "date-fns";
import { BranchFilter } from "@/components/dashboard/BranchFilter";

export default async function FinancialsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string; branchId?: string }>;
}) {
  const tenantId = await getTenantId();
  const resolvedParams = await searchParams;
  
  const endDate = resolvedParams.endDate || format(new Date(), "yyyy-MM-dd");
  const startDate = resolvedParams.startDate || format(subDays(new Date(), 30), "yyyy-MM-dd");
  const branchId = resolvedParams.branchId;

  const data = await getRevenueAnalytics(tenantId, startDate, endDate, branchId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-playfair font-semibold text-obsidian">Financial Intelligence</h1>
          <p className="text-slate-500 font-outfit text-lg">Revenue insights and profitability tracking</p>
        </div>
        <BranchFilter />
      </div>
      
      <FinancialOverview data={data} />
    </div>
  );
}
