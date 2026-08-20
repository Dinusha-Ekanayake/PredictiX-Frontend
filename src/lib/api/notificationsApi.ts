import { apiGet, apiPut, apiDelete } from "@/lib/apiClient";

export type NotificationOut = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  status: "unread" | "read";
  link_url?: string | null;
  priority: "low" | "medium" | "high" | "critical";
  meta: Record<string, any>;
  created_at: string;
};

/** Server-side caps on GET /notifications (app/routers/notifications.py). */
export const NOTIFICATIONS_MAX_LIMIT = 500;

export type FetchNotificationsOptions = {
  status?: "unread" | "read";
  /** Page size. The API rejects anything above NOTIFICATIONS_MAX_LIMIT. */
  limit?: number;
  offset?: number;
};

/**
 * List the current user's notifications, newest first.
 *
 * Accepts either a bare status string (the original call shape, kept so
 * existing callers keep working) or an options object with paging.
 */
export async function fetchNotifications(
  options?: string | FetchNotificationsOptions
): Promise<NotificationOut[]> {
  const opts: FetchNotificationsOptions =
    typeof options === "string" ? { status: options as "unread" | "read" } : options ?? {};

  const params = new URLSearchParams();
  if (opts.status) params.set("status", opts.status);
  if (opts.limit != null) {
    params.set("limit", String(Math.min(opts.limit, NOTIFICATIONS_MAX_LIMIT)));
  }
  if (opts.offset != null) params.set("offset", String(opts.offset));

  const query = params.toString();
  return apiGet<NotificationOut[]>(`/notifications${query ? `?${query}` : ""}`);
}

export async function getUnreadNotifications(): Promise<NotificationOut[]> {
  return apiGet<NotificationOut[]>("/notifications/unread");
}

export async function markNotificationAsRead(id: string): Promise<NotificationOut> {
  return apiPut<NotificationOut>(`/notifications/${id}/mark-read`, {});
}

export async function markAllNotificationsAsRead(): Promise<{ message: string }> {
  return apiPut<{ message: string }>("/notifications/mark-all-read", {});
}

export async function deleteNotification(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/notifications/${id}`);
}
