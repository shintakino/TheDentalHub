import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with your appointment status and clinic alerts.</p>
      </div>

      <div className="text-center py-24 border rounded-lg bg-card shadow-sm space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">You're all caught up!</p>
          <p className="text-muted-foreground">When you have new notifications, they'll show up here.</p>
        </div>
      </div>
    </div>
  );
}
