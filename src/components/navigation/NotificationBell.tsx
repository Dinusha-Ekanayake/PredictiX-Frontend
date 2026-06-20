"use client";

import * as React from "react";
import { Bell, Check, Info, AlertTriangle, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type NotificationOut
} from "@/lib/api/notificationsApi";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useAuth";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = React.useState<NotificationOut[]>([]);
  const [loading, setLoading] = React.useState(true);

  const unreadCount = notifications.filter(n => n.status === "unread").length;

  const loadNotifications = React.useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const { user } = useUser();
  const userId = user?.id;

    // WebSocket Connection
    React.useEffect(() => {
      if (!userId) return;

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";
      const ws = new WebSocket(`${wsUrl}/ws/notifications/${userId}`);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.id) {
          // It's a new notification!
          setNotifications((prev) => [payload, ...prev]);
          toast.info(payload.title, {
            description: payload.message,
          });
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected.");
    };

    return () => {
      ws.close();
    };
  }, [userId]);

  // Close on outside click
  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const handleMarkAsRead = async (id: string, currentStatus: string) => {
    if (currentStatus === "read") return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "read" } : n));
    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark notification as read");
      loadNotifications(); // Revert on failure
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, status: "read" })));
    try {
      await markAllNotificationsAsRead();
      toast.success("All caught up!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark all as read");
      loadNotifications();
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent marking as read when deleting
    
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notification");
      loadNotifications();
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical": return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "high": return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "medium": return <Info className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityBg = (priority: string, status: string) => {
    if (status === "read") return "bg-slate-50 dark:bg-slate-900/50 opacity-70";
    
    switch (priority) {
      case "critical": return "bg-red-50 dark:bg-red-500/10";
      case "high": return "bg-orange-50 dark:bg-orange-500/10";
      case "medium": return "bg-yellow-50 dark:bg-yellow-500/10";
      default: return "bg-blue-50 dark:bg-blue-500/10";
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) loadNotifications(); // Refresh when opening
        }}
        className={cn(
          "relative grid place-items-center rounded-full h-9 w-9",
          "hover:bg-slate-100/70 dark:hover:bg-white/5 transition-all duration-200",
          "cursor-pointer select-none",
          open && "bg-slate-100/70 dark:bg-white/5"
        )}
      >
        <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-slate-900"></span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <div
        className={cn(
          "absolute right-0 top-[calc(100%+10px)] z-[200] w-[340px] sm:w-[380px]",
          "rounded-2xl border border-slate-200/80 dark:border-white/10",
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
          "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]",
          "transition-all duration-200 origin-top-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10">
          <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 px-2"
              onClick={handleMarkAllAsRead}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[350px] overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-100 dark:bg-white/5 rounded-full p-3 mb-3">
                <Bell className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">You have no new notifications.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleMarkAsRead(notification.id, notification.status)}
                  className={cn(
                    "flex gap-3 p-4 border-b border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group",
                    getPriorityBg(notification.meta?.priority || "low", notification.status)
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getPriorityIcon(notification.meta?.priority || "low")}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <p className={cn(
                      "text-sm mb-1 line-clamp-2",
                      notification.status === "unread" ? "font-semibold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {timeAgo(notification.created_at)}
                    </p>
                  </div>
                  
                  {/* Delete button (shows on hover) */}
                  <button
                    onClick={(e) => handleDelete(e, notification.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 transition-all"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {/* Unread dot */}
                  {notification.status === "unread" && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-500 group-hover:opacity-0 transition-opacity" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-2 border-t border-slate-100 dark:border-white/10 text-center">
             <span className="text-[10px] text-muted-foreground/60">
              Only showing recent notifications
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
