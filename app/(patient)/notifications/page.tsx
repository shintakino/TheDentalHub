import { Bell, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default async function NotificationsPage() {
  const { userId } = await auth();
  
  const userNotifications = userId ? await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.createdAt)],
    limit: 20,
  }) : [];

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case "high": return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case "medium": return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <CheckCircle className="w-5 h-5 text-sapphire" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <div>
        <h1 className="text-4xl font-playfair font-bold text-obsidian">Notifications</h1>
        <p className="text-slate-500 font-outfit text-lg">Stay updated with your appointment status and clinic alerts.</p>
      </div>

      {userNotifications.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-2xl bg-alabaster space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-outfit font-medium text-obsidian">You're all caught up!</p>
            <p className="text-slate-500 font-outfit">When you have new notifications, they'll show up here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {userNotifications.map((notif) => (
            <div key={notif.id} className={`p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex gap-6 items-start transition-all hover:shadow-md ${!notif.isRead ? 'border-l-4 border-l-sapphire' : ''}`}>
              <div className="mt-1 shrink-0">
                {getImportanceIcon(notif.importance)}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-outfit font-semibold text-lg text-obsidian">{notif.title}</h3>
                  <span className="text-xs text-slate-400 font-outfit tabular-nums">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-slate-600 font-outfit leading-relaxed">{notif.message}</p>
                {notif.importance === "high" && (
                  <Badge variant="destructive" className="mt-2 uppercase text-[10px] tracking-widest px-2 py-0.5">
                    Action Required
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
