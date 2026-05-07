"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  CreditCard, 
  Activity, 
  ChevronUp, 
  ChevronDown,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialOverviewProps {
  data: {
    summary: {
      totalRevenue: number;
      projectedIncome: number;
      avgRevenuePerAppointment: number;
    };
    serviceProfitability: {
      name: string;
      revenue: number;
      count: number;
    }[];
    revenueByBranch: {
      name: string;
      revenue: number;
    }[];
  };
}

const COLORS = ['#0047FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function FinancialOverview({ data }: FinancialOverviewProps) {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const kpiData = [
    {
      title: "Total Realized Revenue",
      value: currencyFormatter.format(data.summary.totalRevenue),
      icon: DollarSign,
      description: "Completed appointments",
      trend: "+12.5%",
      isPositive: true
    },
    {
      title: "Projected Income",
      value: currencyFormatter.format(data.summary.projectedIncome),
      icon: Activity,
      description: "Booked & in-progress",
      trend: "+5.2%",
      isPositive: true
    },
    {
      title: "Avg. Revenue / Appt",
      value: currencyFormatter.format(data.summary.avgRevenuePerAppointment),
      icon: CreditCard,
      description: "Per completed visit",
      trend: "-2.1%",
      isPositive: false
    }
  ];

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  <kpi.icon className="w-6 h-6" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  kpi.isPositive ? "text-emerald-600" : "text-rose-600"
                )}>
                  {kpi.isPositive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {kpi.trend}
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-slate-500 text-sm font-medium font-outfit uppercase tracking-wider">{kpi.title}</h3>
                <div className="text-3xl font-serif font-bold text-obsidian">{kpi.value}</div>
                <p className="text-slate-400 text-sm">{kpi.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Profitability */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-serif font-semibold">Service Profitability</CardTitle>
          </CardHeader>
          <CardContent className="px-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.serviceProfitability}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#0047FF" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Branch */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-serif font-semibold">Revenue by Branch</CardTitle>
          </CardHeader>
          <CardContent className="px-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.revenueByBranch}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {data.revenueByBranch.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => currencyFormatter.format(Number(value))}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
