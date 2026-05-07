"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import { AnalyticsResponse, ComparativeMetric, Recommendation } from "@/lib/validations";
import { Users, Calendar, Clock, AlertCircle, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AnalyticsOverviewProps {
  data: AnalyticsResponse;
  comparativeData?: ComparativeMetric[];
  recommendations?: Recommendation[];
}

export function AnalyticsOverview({ data, comparativeData, recommendations }: AnalyticsOverviewProps) {
  const stats = [
    { title: "Total Bookings", value: data.summary.totalBookings, icon: Calendar, color: "text-blue-600" },
    { title: "No-Show Rate", value: `${(data.summary.noShowRate * 100).toFixed(1)}%`, icon: AlertCircle, color: "text-rose-600" },
    { title: "Avg Utilization", value: `${(data.summary.avgUtilization * 100).toFixed(0)}%`, icon: Users, color: "text-emerald-600" },
    { title: "Peak Hour", value: data.summary.peakHour, icon: Clock, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Optimization Insights */}
      {recommendations && recommendations.length > 0 && (
        <Card className="border-none shadow-[0_4px_32px_rgba(255,107,0,0.1)] bg-amber-50/30 overflow-hidden">
          <CardHeader className="bg-amber-50/50 pb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600" />
              <CardTitle className="font-playfair text-xl text-amber-900">Intelligence Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-amber-100">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-6 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={rec.priority === "high" ? "destructive" : "secondary"} className="uppercase text-[10px] tracking-widest">
                        {rec.priority} priority
                      </Badge>
                      <h4 className="font-outfit font-semibold text-amber-900">{rec.title}</h4>
                    </div>
                    <p className="text-amber-800/70 text-sm">{rec.description}</p>
                  </div>
                  {rec.action && (
                    <Button variant="outline" size="sm" className="shrink-0 border-amber-200 text-amber-700 hover:bg-amber-100">
                      {rec.action} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium font-outfit text-slate-500 uppercase tracking-wider">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-playfair font-semibold text-obsidian">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-6 border-none shadow-[0_4px_32px_rgba(0,0,0,0.06)] bg-white">
          <CardHeader>
            <CardTitle className="font-playfair text-xl text-obsidian">Booking Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#0047FF" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Branch Leaderboard */}
        {comparativeData ? (
          <Card className="p-6 border-none shadow-[0_4px_32px_rgba(0,0,0,0.06)] bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-playfair text-xl text-obsidian">Branch Performance</CardTitle>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent className="h-[300px] overflow-auto">
              <div className="space-y-6">
                {comparativeData
                  .sort((a, b) => b.bookingCount - a.bookingCount)
                  .map((branch, i) => (
                    <div key={branch.branchId} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-outfit text-slate-400 font-bold">#{i + 1}</span>
                          <span className="font-outfit font-medium text-slate-700">{branch.branchName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>{branch.bookingCount} bookings</span>
                          <span>•</span>
                          <span>{Math.round(branch.utilization * 100)}% utilized</span>
                        </div>
                      </div>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${branch.utilization > 0.8 ? 'bg-rose-500' : branch.utilization > 0.5 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${branch.utilization * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-6 border-none shadow-[0_4px_32px_rgba(0,0,0,0.06)] bg-white">
            <CardHeader>
              <CardTitle className="font-playfair text-xl text-obsidian">Volume by Hour</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0047FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
