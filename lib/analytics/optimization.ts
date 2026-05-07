import { getComparativeAnalytics } from "./queries";

export interface OptimizationRecommendation {
  type: "staff_movement" | "capacity_expansion" | "marketing_push";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action?: string;
}

export async function getNetworkRecommendations(tenantId: string): Promise<OptimizationRecommendation[]> {
  const branchMetrics = await getComparativeAnalytics(tenantId);
  const recommendations: OptimizationRecommendation[] = [];

  // 1. Staff Movement (Utilization Imbalance)
  const highUtilizationBranches = branchMetrics.filter(b => b.utilization > 0.85);
  const lowUtilizationBranches = branchMetrics.filter(b => b.utilization < 0.45);

  if (highUtilizationBranches.length > 0 && lowUtilizationBranches.length > 0) {
    for (const high of highUtilizationBranches) {
      for (const low of lowUtilizationBranches) {
        recommendations.push({
          type: "staff_movement",
          priority: "high",
          title: `Resource Imbalance: ${high.branchName} vs ${low.branchName}`,
          description: `${high.branchName} is operating at ${Math.round(high.utilization * 100)}% capacity, while ${low.branchName} is at ${Math.round(low.utilization * 100)}%. Consider temporarily reassigning staff to balance the load.`,
          action: "Adjust Staff Roster"
        });
      }
    }
  }

  // 2. Capacity Expansion
  const atMaxCapacity = branchMetrics.filter(b => b.utilization > 0.95);
  for (const branch of atMaxCapacity) {
    recommendations.push({
      type: "capacity_expansion",
      priority: "medium",
      title: `Expand Capacity: ${branch.branchName}`,
      description: `${branch.branchName} is consistently near 100% utilization. Consider adding more chairs or extending operating hours.`,
      action: "Manage Branch Capacity"
    });
  }

  // 3. Marketing Push
  const underUtilized = branchMetrics.filter(b => b.utilization < 0.3 && b.bookingCount < 50);
  for (const branch of underUtilized) {
    recommendations.push({
      type: "marketing_push",
      priority: "low",
      title: `Low Demand: ${branch.branchName}`,
      description: `${branch.branchName} has low utilization (${Math.round(branch.utilization * 100)}%). Consider a targeted marketing campaign or special offers for this location.`,
      action: "Create Campaign"
    });
  }

  return recommendations;
}
