"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchNotifications, type NotificationOut } from "@/lib/api/notificationsApi";

import {
  EmptyNotifications,
  priorityIcon,
  priorityOf,
  priorityRowBg,
  timeAgo,
} from "./notificationUi";

/** Rows fetched per request. The API caps `limit` at 500. */
const PAGE_SIZE = 30;

type Filter = "all" | "unread" | "read";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

/**
 * Full notification history.
 *
 * The bell dropdown deliberately shows only the newest slice; this window pages
 * through everything via the API's offset/limit, so the footer link is a real
 * feature rather than a label change. Each page is requested only when asked
 * for, so opening this never pulls the entire history at once.
 */
export default function NotificationHistoryDialog({
  open,
  onOpenChange,
  onSelect,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (n: NotificationOut) => void;
  onDelete: (id: string) => void;
}) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [items, setItems] = React.useState<NotificationOut[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Guards against an earlier, slower request overwriting a newer one when the
  // filter is changed quickly.
  const requestRef = React.useRef(0);

  const loadFirstPage = React.useCallback(async (f: Filter) => {
    const req = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications({
        status: f === "all" ? undefined : f,
        limit: PAGE_SIZE,
        offset: 0,
      });
      if (req !== requestRef.current) return;
      setItems(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      if (req !== requestRef.current) return;
      console.error("Failed to load notification history", err);
      setError("Could not load notification history.");
      setItems([]);
      setHasMore(false);
    } finally {
      if (req === requestRef.current) setLoading(false);
    }
  }, []);

  // Reload whenever the window is opened, so it never shows a stale history.
  React.useEffect(() => {
    if (open) loadFirstPage(filter);
  }, [open, filter, loadFirstPage]);

  const loadMore = async () => {
    const req = requestRef.current;
    setLoadingMore(true);
    try {
      const data = await fetchNotifications({
        status: filter === "all" ? undefined : filter,
        limit: PAGE_SIZE,
        offset: items.length,
      });
      if (req !== requestRef.current) return;
      // De-duplicate: a notification arriving while paging would otherwise
      // shift every row down and repeat one across the page boundary.
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...data.filter((d) => !seen.has(d.id))];
      });
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to load more notifications", err);
      setError("Could not load more notifications.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRowClick = (n: NotificationOut) => {
    // Mirror the optimistic read-marking the parent performs, so this list and
    // the bell agree without a refetch.
    setItems((prev) =>
      prev.map((p) => (p.id === n.id ? { ...p, status: "read" as const } : p))
    );
    onSelect(n);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((p) => p.id !== id));
    onDelete(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[85vh] grid-rows-[auto_auto_minmax(0,1fr)] p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base">Notification history</DialogTitle>
          <DialogDescription>
            Every notification sent to your account, newest first.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1 border-b border-slate-100 px-5 pb-3 dark:border-white/10">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === f.key
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
              )}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-muted-foreground">
            {items.length > 0 && `${items.length} loaded`}
          </span>
        </div>

        {/* min-h-0 lets this grid row shrink so the list scrolls instead of
            pushing the dialog past max-h. */}
        <div className="min-h-0 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading history…
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => loadFirstPage(filter)}
              >
                Try again
              </Button>
            </div>
          ) : items.length === 0 ? (
            <EmptyNotifications
              title="Nothing here"
              subtitle={
                filter === "all"
                  ? "You have not received any notifications yet."
                  : `You have no ${filter} notifications.`
              }
            />
          ) : (
            <>
              <div className="flex flex-col">
                {items.map((n) => (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRowClick(n)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRowClick(n);
                      }
                    }}
                    className={cn(
                      "group relative flex cursor-pointer gap-3 border-b border-slate-100 p-4 transition-colors",
                      "hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
                      "dark:border-white/5 dark:hover:bg-slate-800/50",
                      priorityRowBg(priorityOf(n), n.status)
                    )}
                  >
                    <div className="mt-0.5 shrink-0">{priorityIcon(priorityOf(n))}</div>
                    <div className="min-w-0 flex-1 pr-8">
                      <p
                        className={cn(
                          "mb-1 line-clamp-1 text-sm",
                          n.status === "unread"
                            ? "font-semibold text-slate-900 dark:text-white"
                            : "font-medium text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {n.title}
                      </p>
                      <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                        {n.message}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, n.id)}
                      className="absolute right-3 top-3 rounded-md p-1.5 text-red-500 opacity-0 transition-all hover:bg-red-100 group-hover:opacity-100 focus-visible:opacity-100 dark:hover:bg-red-500/20"
                      aria-label={`Delete notification: ${n.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {n.status === "unread" && (
                      <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-violet-500 transition-opacity group-hover:opacity-0" />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 text-center">
                {hasMore ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                    {loadingMore ? "Loading…" : "Load older notifications"}
                  </Button>
                ) : (
                  <span className="text-[11px] text-muted-foreground/70">
                    You have reached the end of your history.
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
