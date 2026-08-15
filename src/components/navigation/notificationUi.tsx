"use client";

import * as React from "react";
import { AlertCircle, AlertTriangle, Bell, Info } from "lucide-react";

import type { NotificationOut } from "@/lib/api/notificationsApi";

/**
 * Presentation helpers shared by the notification bell, the single-notification
 * window and the full-history window, so the three views can never drift apart
 * on how a priority or a timestamp is rendered.
 */

/**
 * Priority is written into `meta.priority` by the backend notification service,
 * not into a top-level column, so every view has to read it the same way.
 */
export function priorityOf(n: NotificationOut): string {
  return (n.meta?.priority as string) || n.priority || "low";
}

export function priorityIcon(priority: string, className = "w-5 h-5") {
  switch (priority) {
    case "critical":
      return <AlertCircle className={`${className} text-red-500`} />;
    case "high":
      return <AlertTriangle className={`${className} text-orange-500`} />;
    case "medium":
      return <Info className={`${className} text-yellow-500`} />;
    default:
      return <Info className={`${className} text-blue-500`} />;
  }
}

export function priorityRowBg(priority: string, status: string) {
  if (status === "read") return "bg-slate-50 dark:bg-slate-900/50 opacity-70";
  switch (priority) {
    case "critical":
      return "bg-red-50 dark:bg-red-500/10";
    case "high":
      return "bg-orange-50 dark:bg-orange-500/10";
    case "medium":
      return "bg-yellow-50 dark:bg-yellow-500/10";
    default:
      return "bg-blue-50 dark:bg-blue-500/10";
  }
}

export function priorityBadgeClass(priority: string) {
  switch (priority) {
    case "critical":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
    case "high":
      return "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300";
    default:
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
  }
}

/** "maintenance_due" -> "Maintenance due" */
export function humanizeType(type: string | null | undefined) {
  if (!type) return "Notification";
  const spaced = type.replace(/_/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function timeAgo(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

/** Full, unambiguous timestamp for the detail window. */
export function fullTimestamp(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Shared "nothing here" state. */
export function EmptyNotifications({
  title = "All caught up!",
  subtitle = "You have no new notifications.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="p-8 flex flex-col items-center justify-center text-center">
      <div className="bg-slate-100 dark:bg-white/5 rounded-full p-3 mb-3">
        <Bell className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
