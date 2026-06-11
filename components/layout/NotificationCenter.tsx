"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Bell, Check, Trash2, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  importance: "low" | "medium" | "high";
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { data: notifications = [], mutate } = useSWR<Notification[]>(
    "/api/notifications",
    fetcher,
    { refreshInterval: 15000 } // Poll every 15s
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    // Optimistic update
    mutate(
      notifications.map(n => ({ ...n, isRead: true })),
      false
    );
    
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true })
      });
      mutate();
    } catch (error) {
      toast.error("Failed to mark notifications as read");
      mutate(); // Revert
    }
  };

  const markAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;

    // Optimistic update
    mutate(
      notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
      false
    );

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [id] })
      });
      mutate();
    } catch (error) {
      mutate(); // Revert
    }
  };

  const getIcon = (importance: string) => {
    switch (importance) {
      case "high": return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case "medium": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-full w-10 h-10 transition-colors" />}>
        <Bell className="w-5 h-5 text-slate-600" />
        {isMounted && unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-rose-500 text-white rounded-full text-[10px] border-2 border-white animate-in zoom-in"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-[380px] p-0 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-slate-100 font-outfit overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-slate-50/80 backdrop-blur-sm border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {isMounted && unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] px-2 py-0.5">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {isMounted && unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs text-slate-500 hover:text-slate-800"
              onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {!isMounted || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => markAsRead(notification.id, notification.isRead)}
                  className={cn(
                    "p-4 transition-colors cursor-pointer hover:bg-slate-50",
                    !notification.isRead ? "bg-primary/[0.02]" : "opacity-75"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="mt-1 flex-shrink-0">
                      {getIcon(notification.importance)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm font-medium line-clamp-1",
                          !notification.isRead ? "text-slate-800" : "text-slate-600"
                        )}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
