// Add this function to your existing assets API client

export async function sendServiceReminder(assetId: string): Promise<{
    sent: boolean;
    to: string;
    asset_id: string;
    service_date: string;
    days_remaining: number;
    trigger: string;
    error: string | null;
  }> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token") ?? localStorage.getItem("token")
        : null;
  
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  
    const res = await fetch(`${baseUrl}/assets/${assetId}/send-service-reminder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Request failed: ${res.status}`);
    }
  
    return res.json();
  }