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

export async function fetchNotifications(status?: string): Promise<NotificationOut[]> {
  const query = status ? `?status=${status}` : "";
  return apiGet<NotificationOut[]>(`/notifications${query}`);
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
