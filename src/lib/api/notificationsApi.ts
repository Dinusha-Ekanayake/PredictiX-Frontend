const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        localStorage.getItem("predictix.access_token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

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
  const url = new URL(`${API_URL}/notifications/`);
  if (status) {
    url.searchParams.append("status", status);
  }
  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch notifications: ${res.status}`);
  }
  return res.json();
}

export async function getUnreadNotifications(): Promise<NotificationOut[]> {
  const res = await fetch(`${API_URL}/notifications/unread`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch unread notifications: ${res.status}`);
  }
  return res.json();
}

export async function markNotificationAsRead(id: string): Promise<NotificationOut> {
  const res = await fetch(`${API_URL}/notifications/${id}/mark-read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to mark notification as read: ${res.status}`);
  }
  return res.json();
}

export async function markAllNotificationsAsRead(): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/notifications/mark-all-read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to mark all as read: ${res.status}`);
  }
  return res.json();
}

export async function deleteNotification(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/notifications/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete notification: ${res.status}`);
  }
  return res.json();
}
