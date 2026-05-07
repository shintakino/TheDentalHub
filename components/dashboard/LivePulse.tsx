"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface BranchOccupancy {
  branchId: string;
  branchName: string;
  maxCapacity: number;
  currentOccupancy: number;
}

export function LivePulse() {
  const { data, error, isLoading } = useSWR<BranchOccupancy[]>(
    "/api/branches/occupancy",
    fetcher,
    { refreshInterval: 5000 } // Refresh every 5 seconds
  );

  if (error) return <div>Failed to load occupancy data</div>;
  if (isLoading) return <div>Loading live pulse...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((branch) => {
        const occupancyPercentage = (branch.currentOccupancy / branch.maxCapacity) * 100;
        const isHigh = occupancyPercentage > 80;

        return (
          <Card key={branch.branchId} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {branch.branchName}
              </CardTitle>
              <Activity className={cn(
                "h-4 w-4 animate-pulse",
                branch.currentOccupancy > 0 ? "text-green-500" : "text-muted-foreground"
              )} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {branch.currentOccupancy} / {branch.maxCapacity}
              </div>
              <p className="text-xs text-muted-foreground">
                Patients currently in building
              </p>
              <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    isHigh ? "bg-destructive" : "bg-primary"
                  )}
                  style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                />
              </div>
            </CardContent>
            {/* Subtle heartbeat animation overlay if active */}
            {branch.currentOccupancy > 0 && (
              <div className="absolute top-0 right-0 p-2">
                <div className="flex h-2 w-2 rounded-full bg-green-500">
                  <div className="absolute h-2 w-2 animate-ping rounded-full bg-green-500 opacity-75" />
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
