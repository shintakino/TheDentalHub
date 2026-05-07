"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface LoyaltyCardProps {
  points: number;
}

export function LoyaltyCard({ points }: LoyaltyCardProps) {
  const nextRewardPoints = 500;
  const progress = Math.min((points / nextRewardPoints) * 100, 100);

  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium font-outfit">Loyalty Program</CardTitle>
        <div className="bg-white/20 p-2 rounded-full">
          <Star className="h-5 w-5 fill-white text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-bold font-heading">{points} pts</div>
            <p className="text-white/80 text-sm">Active Balance</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>Next Reward: {nextRewardPoints} pts</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
            <p className="text-[10px] text-white/60">
              {points >= nextRewardPoints 
                ? "You have a reward available! Redeem it at your next visit." 
                : `${nextRewardPoints - points} points until your next reward`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
