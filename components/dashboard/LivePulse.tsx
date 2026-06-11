"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Armchair } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface BranchOccupancy {
  branchId: string;
  branchName: string;
  maxCapacity: number;
  currentOccupancy: number;
  inChairCount: number;
  waitingCount: number;
}

export function LivePulse() {
  const { data, error, isLoading } = useSWR<BranchOccupancy[]>(
    "/api/branches/occupancy",
    fetcher,
    { refreshInterval: 5000 } // Refresh every 5 seconds
  );

  if (error) return <div className="p-4 text-rose-500 border border-rose-100 bg-rose-50 rounded-xl text-sm font-outfit">Failed to load occupancy data</div>;
  if (isLoading) return <div className="p-8 text-center text-slate-400 font-outfit animate-pulse">Loading Live Pulse...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((branch) => {
        const chairsUsedPercentage = (branch.inChairCount / branch.maxCapacity) * 100;
        const isOverCapacity = branch.inChairCount > branch.maxCapacity;

        return (
          <Card key={branch.branchId} className={cn(
            "relative overflow-hidden transition-all duration-300 border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)]",
            isOverCapacity ? "ring-1 ring-rose-400 bg-rose-50/30" : "bg-white"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-50">
              <CardTitle className="text-sm font-outfit font-semibold text-slate-700">
                {branch.branchName}
              </CardTitle>
              <Activity className={cn(
                "h-4 w-4 transition-colors duration-500",
                branch.currentOccupancy > 0 ? "text-emerald-500 animate-pulse" : "text-slate-300"
              )} />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Armchair className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Operatories</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-3xl font-playfair font-bold",
                      isOverCapacity ? "text-rose-600" : "text-obsidian"
                    )}>
                      {branch.inChairCount}
                    </span>
                    <span className="text-sm text-slate-400 font-outfit font-medium">/ {branch.maxCapacity}</span>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-1.5 text-slate-500 mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Waiting</span>
                  </div>
                  <div className={cn(
                    "text-3xl font-playfair font-bold",
                    branch.waitingCount > 0 ? "text-amber-500" : "text-slate-300"
                  )}>
                    {branch.waitingCount}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-outfit font-medium">
                  <span className={isOverCapacity ? "text-rose-500" : "text-slate-400"}>
                    {isOverCapacity ? "Chairs Overbooked!" : "Chair Utilization"}
                  </span>
                  <span className={isOverCapacity ? "text-rose-600 font-bold" : "text-slate-500"}>
                    {Math.round(chairsUsedPercentage)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-700 ease-in-out rounded-full",
                      isOverCapacity ? "bg-rose-500" : 
                      chairsUsedPercentage > 80 ? "bg-amber-500" : "bg-primary"
                    )}
                    style={{ width: `${Math.min(chairsUsedPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
            
            {/* Active Indicator overlay */}
            {branch.currentOccupancy > 0 && (
              <div className="absolute top-4 right-4 flex h-2 w-2 rounded-full bg-emerald-500">
                <div className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-500 opacity-75" />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
