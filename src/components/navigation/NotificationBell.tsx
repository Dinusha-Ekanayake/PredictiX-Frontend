"use client";

import * as React from "react";
import { Bell, Trash2, CheckCircle2, History } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type NotificationOut
} from "@/lib/api/notificationsApi";
import { toast } from "@/lib/customToast";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useAuth";
import { getAccessToken, logout } from "@/lib/authService";

import NotificationDetailDialog from "./NotificationDetailDialog";
import NotificationHistoryDialog from "./NotificationHistoryDialog";
import {
  EmptyNotifications,
  priorityIcon,
  priorityOf,
  priorityRowBg,
  timeAgo,
} from "./notificationUi";

/**
 * How many notifications the dropdown itself holds. The dropdown is a quick
 * glance at what is recent; everything older is reachable through the history
 * window, which pages the same endpoint.
 */
const BELL_LIMIT = 30;

export default function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = React.useState<NotificationOut[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Single-notification window (full title + full message).
  const [selected, setSelected] = React.useState<NotificationOut | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  // Full paged history window.
  const [historyOpen, setHistoryOpen] = React.useState(false);

  const unreadCount = notifications.filter(n => n.status === "unread").length;

  const loadNotifications = React.useCallback(async () => {
    try {
      const data = await fetchNotifications({ limit: BELL_LIMIT });
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

    // WebSocket Connection — reconnects with backoff on a transient drop
    // (network blip, backend restart/redeploy), and treats an auth
    // rejection (WS_1008_POLICY_VIOLATION, the only close code
    // websockets.py's _verify_ws_token ever sends) exactly like a REST 401
    // in apiClient.ts: the token is dead, not just this socket, so force a
    // re-login instead of quietly retrying with a token that will never
    // succeed.
    React.useEffect(() => {
      if (!userId) return;

      let cancelled = false;
      let ws: WebSocket | null = null;
      let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
      let reconnectAttempt = 0;
      const MAX_RECONNECT_DELAY_MS = 30_000;

      function connect() {
        // Re-read the token on every (re)connect attempt, not just once —
        // a long-lived tab may reconnect hours after mount, by which point
        // the original token could be stale.
        const token = getAccessToken();
        if (!token) return; // logged out elsewhere — nothing to reconnect to

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";
        ws = new WebSocket(
          `${wsUrl}/ws/notifications/${userId}?token=${encodeURIComponent(token)}`
        );

        ws.onopen = () => {
          reconnectAttempt = 0; // reset backoff once a connection actually succeeds
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload && payload.id) {
              // It's a new notification!
              setNotifications((prev) => [payload, ...prev]);
              toast.info(payload.title, {
                description: payload.message,
              });

              // Trigger Proactive Alert if critical
              if (payload.is_critical || (payload.title || "").toLowerCase().includes("critical") || payload.type === "critical") {
                const customEvent = new CustomEvent("proactive_alert", { detail: payload });
                window.dispatchEvent(customEvent);
              }
            }
          } catch (err) {
            console.error("Failed to parse websocket message", err);
          }
        };

        ws.onclose = (event) => {
          if (cancelled) return;

          if (event.code === 1008) {
            // Same session-expiry handling as apiClient.ts's 401 path.
            logout();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return;
          }

          reconnectAttempt += 1;
          const delay = Math.min(1000 * 2 ** reconnectAttempt, MAX_RECONNECT_DELAY_MS);
          reconnectTimer = setTimeout(connect, delay);
        };
      }

      connect();

      return () => {
        cancelled = true;
        if (reconnectTimer) clearTimeout(reconnectTimer);
        ws?.close();
      };
    }, [userId]);

  // Both windows are portalled to <body>, so they are "outside" the dropdown's
  // container and Escape inside them also bubbles here. Without this guard,
  // opening a notification would close the dropdown underneath it, and one
  // Escape would dismiss the dialog and the dropdown together.
  const dialogOpen = detailOpen || historyOpen;

  // Close on outside click
  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open && !dialogOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open, dialogOpen]);

  // Close on Escape
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open && !dialogOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, dialogOpen]);

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

  /** Shared by the row's trash icon, the detail window and the history window. */
  const deleteById = React.useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notification");
      loadNotifications();
    }
  }, [loadNotifications]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent marking as read when deleting
    deleteById(id);
  };

  /**
   * Open one notification in its own window. Reading it marks it read, which is
   * applied to the copy handed to the dialog too so the "Unread" badge does not
   * linger on a notification the user is actively looking at.
   */
  const handleOpenNotification = (notification: NotificationOut) => {
    setSelected({ ...notification, status: "read" });
    setDetailOpen(true);
    handleMarkAsRead(notification.id, notification.status);
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

        {/* Scrolls on its own. A viewport-relative ceiling keeps the panel from
            running off the bottom of short screens, where a fixed pixel height
            would push the history link out of reach. */}
        <div className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open notification: ${notification.title}`}
                  onClick={() => handleOpenNotification(notification)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenNotification(notification);
                    }
                  }}
                  className={cn(
                    "flex gap-3 p-4 border-b border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
                    priorityRowBg(priorityOf(notification), notification.status)
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {priorityIcon(priorityOf(notification))}
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
                    type="button"
                    onClick={(e) => handleDelete(e, notification.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 transition-all"
                    aria-label={`Delete notification: ${notification.title}`}
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
        </div>

        <div className="p-2 border-t border-slate-100 dark:border-white/10">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:text-violet-300 dark:hover:bg-violet-500/10"
            onClick={() => {
              setOpen(false);
              setHistoryOpen(true);
            }}
          >
            <History className="w-3.5 h-3.5 mr-1.5" />
            View full notification history
          </Button>
        </div>
      </div>

      {/* One notification, in full. Opened from either the dropdown or the
          history window, so there is a single instance rather than two. */}
      <NotificationDetailDialog
        notification={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDelete={deleteById}
      />

      <NotificationHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onSelect={handleOpenNotification}
        onDelete={deleteById}
      />
    </div>
  );
}
