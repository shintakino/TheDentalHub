"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { AnalyticsResponse } from "@/lib/validations";
import { Users, Calendar, Clock, AlertCircle } from "lucide-react";

export function AnalyticsOverview({ data }: { data: AnalyticsResponse }) {
  const stats = [
    { title: "Total Bookings", value: data.summary.totalBookings, icon: Calendar, color: "text-blue-600" },
    { title: "No-Show Rate", value: `${(data.summary.noShowRate * 100).toFixed(1)}%`, icon: AlertCircle, color: "text-rose-600" },
    { title: "Avg Utilization", value: `${(data.summary.avgUtilization * 100).toFixed(0)}%`, icon: Users, color: "text-emerald-600" },
    { title: "Peak Hour", value: data.summary.peakHour, icon: Clock, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8">
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
          <CardContent className="h-[300px]">
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

        <Card className="p-6 border-none shadow-[0_4px_32px_rgba(0,0,0,0.06)] bg-white">
          <CardHeader>
            <CardTitle className="font-playfair text-xl text-obsidian">Volume by Hour</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
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
      </div>
    </div>
  );
}
