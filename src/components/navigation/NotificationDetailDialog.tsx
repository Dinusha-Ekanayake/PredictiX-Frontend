"use client";

import * as React from "react";
import { ArrowUpRight, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavRouter } from "@/components/navigation/useNavRouter";
import type { NotificationOut } from "@/lib/api/notificationsApi";

import {
  fullTimestamp,
  humanizeType,
  priorityBadgeClass,
  priorityIcon,
  priorityOf,
} from "./notificationUi";

/**
 * Single notification, shown in full.
 *
 * The bell list clamps both title and message to two lines, so anything longer
 * was unreadable without this. Here the message is rendered whole, wrapped, and
 * with its original line breaks preserved — only the message body scrolls, so
 * the header and actions stay put however long the text is.
 */
export default function NotificationDetailDialog({
  notification,
  open,
  onOpenChange,
  onDelete,
}: {
  notification: NotificationOut | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
}) {
  const router = useNavRouter();

  // Keep the last non-null notification during the close animation, otherwise
  // the dialog visibly empties itself on the way out.
  const [shown, setShown] = React.useState<NotificationOut | null>(notification);
  React.useEffect(() => {
    if (notification) setShown(notification);
  }, [notification]);

  const n = notification ?? shown;
  if (!n) return null;

  const priority = priorityOf(n);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Sits above the history window (z-50) when opened from it. Radix
          portals in mount order, so the later portal already paints on top;
          the explicit z-index makes that independent of mount order. */}
      <DialogContent className="z-[210] w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <div className="mt-0.5 shrink-0">{priorityIcon(priority)}</div>
            <div className="min-w-0 flex-1">
              {/* No line clamp: the whole point of this window. */}
              <DialogTitle className="text-base leading-snug break-words text-left">
                {n.title}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-left">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      priorityBadgeClass(priority)
                    )}
                  >
                    {priority}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/8 dark:text-slate-300">
                    {humanizeType(n.type)}
                  </span>
                  {n.status === "unread" && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                      Unread
                    </span>
                  )}
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Only this region scrolls. `min-h-0` is required for a grid child to
            be allowed to shrink below its content height and scroll at all. */}
        <div className="min-h-0 overflow-y-auto rounded-lg bg-slate-50 p-3 dark:bg-white/4">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {n.message}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11px] text-muted-foreground">
            {fullTimestamp(n.created_at)}
          </span>
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
                onClick={() => {
                  onDelete(n.id);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            )}
            {n.link_url && (
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  router.push(n.link_url as string);
                }}
              >
                Open
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
