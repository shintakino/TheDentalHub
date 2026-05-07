"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, startOfDay, addDays, eachDayOfInterval } from "date-fns";
import { Fragment } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface HeatmapData {
  branchId: string;
  timestamp: string;
  density: number;
  bookingCount: number;
  maxCapacity: number;
}

export function NetworkHeatmap() {
  const { data, error, isLoading } = useSWR<HeatmapData[]>(
    "/api/analytics/heatmap",
    fetcher
  );

  if (error) return <div>Failed to load heatmap</div>;
  if (isLoading) return <div>Loading intelligence matrix...</div>;

  // Process data for 30 days
  const today = new Date();
  const days = eachDayOfInterval({
    start: addDays(today, -29),
    end: today
  });

  // Unique branches
  const branchIds = Array.from(new Set(data?.map(d => d.branchId)));
  
  // We'll just show daily density for the heatmap if hourly is too dense for the grid
  // Or we can group by day for the main grid.
  
  const getDensityForDay = (branchId: string, day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayData = data?.filter(d => 
      d.branchId === branchId && d.timestamp.startsWith(dayStr)
    );
    
    if (!dayData || dayData.length === 0) return 0;
    
    const avgDensity = dayData.reduce((acc, curr) => acc + curr.density, 0) / dayData.length;
    return avgDensity;
  };

  const getSurgicalSapphire = (density: number) => {
    if (density <= 0.3) return "bg-white border-slate-100";
    if (density <= 0.7) return "bg-blue-200 border-blue-300";
    return "bg-blue-600 border-blue-700";
  };

  return (
    <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
      <CardHeader>
        <CardTitle className="font-playfair text-2xl">Network Utilization Heatmap</CardTitle>
        <p className="text-sm text-slate-500 font-outfit">Visualizing demand density across all physical locations (Last 30 Days).</p>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[150px_repeat(30,1fr)] gap-1">
                <div />
                {days.map((day, i) => (
                  <div key={i} className="text-[10px] text-slate-400 text-center font-outfit truncate">
                    {i % 5 === 0 ? format(day, "MMM d") : ""}
                  </div>
                ))}
                
                {branchIds.map(branchId => (
                  <Fragment key={branchId}>
                    <div className="text-xs font-semibold py-2 truncate pr-4 font-outfit">
                      Branch {branchId.slice(0, 4)}...
                    </div>
                    {days.map((day, i) => {
                      const density = getDensityForDay(branchId, day);
                      return (
                        <Tooltip key={`${branchId}-${i}`}>
                          <TooltipTrigger
                            className={cn(
                              "h-8 rounded-sm border transition-all cursor-pointer hover:ring-2 hover:ring-primary/20",
                              getSurgicalSapphire(density)
                            )}
                          />
                          <TooltipContent>
                            <p className="font-outfit text-xs">
                              Branch {branchId.slice(0, 4)}: {Math.round(density * 100)}% Utilization
                            </p>
                            <p className="text-[10px] text-slate-400">{format(day, "PPPP")}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </TooltipProvider>
        
        <div className="mt-8 flex items-center gap-6 text-xs font-outfit text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-white border border-slate-200 rounded-sm" />
            <span>Low (0-30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-blue-200 border border-blue-300 rounded-sm" />
            <span>Medium (31-70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-blue-600 border border-blue-700 rounded-sm" />
            <span>High (71-100%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
