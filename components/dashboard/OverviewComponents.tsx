import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Settings, 
  Palette, 
  UserPlus, 
  PlusSquare,
  CheckCircle2,
  CalendarDays,
  XCircle,
  Clock
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KPISnapshotProps {
  stats: {
    total: number;
    checkedIn: number;
    noShow: number;
    cancelled: number;
  };
}

export function KPISnapshot({ stats }: KPISnapshotProps) {
  const kpis = [
    { 
      label: "Total Bookings", 
      value: stats.total, 
      icon: CalendarDays, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Checked In", 
      value: stats.checkedIn, 
      icon: CheckCircle2, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      label: "No-Shows", 
      value: stats.noShow, 
      icon: Clock, 
      color: "text-amber-600", 
      bg: "bg-amber-50" 
    },
    { 
      label: "Cancelled", 
      value: stats.cancelled, 
      icon: XCircle, 
      color: "text-red-600", 
      bg: "bg-red-50" 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", kpi.bg)}>
                <kpi.icon className={cn("w-5 h-5", kpi.color)} />
              </div>
              <div>
                <p className="text-sm font-outfit text-slate-500 font-medium">{kpi.label}</p>
                <p className="text-2xl font-serif font-bold text-obsidian">{kpi.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function QuickActions({ tenantSlug }: { tenantSlug: string }) {
  const actions = [
    { label: "Manage Branches", href: `/manage/${tenantSlug}/settings?tab=branches`, icon: PlusSquare },
    { label: "Add Service", href: `/manage/${tenantSlug}/settings?tab=services`, icon: Plus },
    { label: "Invite Staff", href: `/manage/${tenantSlug}/settings?tab=staff`, icon: UserPlus },
    { label: "Update Branding", href: `/manage/${tenantSlug}/branding`, icon: Palette },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {actions.map((action) => (
        <Button 
          key={action.label} 
          variant="outline" 
          asChild 
          className="bg-white border-slate-100 rounded-xl hover:bg-slate-50 hover:text-primary transition-all font-outfit font-medium text-slate-600 shadow-sm"
        >
          <Link href={action.href}>
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}

interface Activity {
  id: string;
  action: string;
  patientName?: string;
  timestamp: Date;
  payload: any;
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl">
      <CardHeader>
        <CardTitle className="font-playfair text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.length === 0 ? (
            <p className="text-slate-400 text-sm font-outfit py-4">No recent activity logs found.</p>
          ) : (
            activities.map((activity, i) => (
              <div key={activity.id} className="relative flex gap-4">
                {i !== activities.length - 1 && (
                  <div className="absolute left-[11px] top-7 bottom-[-24px] w-[2px] bg-slate-50" />
                )}
                <div className="z-10 w-6 h-6 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-outfit text-obsidian font-medium">
                    {activity.action === 'status_changed' ? (
                      <>
                        Status changed to <span className="text-primary font-bold">{activity.payload?.to}</span>
                        {activity.patientName && ` for ${activity.patientName}`}
                      </>
                    ) : (
                      activity.action.replace('_', ' ')
                    )}
                  </p>
                  <p className="text-xs font-outfit text-slate-400 uppercase tracking-tighter">
                    {new Intl.RelativeTimeFormat('en', { style: 'short' }).format(
                      Math.ceil((activity.timestamp.getTime() - Date.now()) / (1000 * 60)),
                      'minute'
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
