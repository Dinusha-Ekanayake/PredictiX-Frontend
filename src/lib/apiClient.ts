/**
 * Authenticated API Client
 * Automatically attaches Bearer token to all requests.
 * On 401 → logs out and redirects to /login (no refresh token in current auth scheme).
 */

import { getAccessToken, logout } from "./authService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Core fetch wrapper — attaches JWT and handles 401.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please login again.");
  }

  return response;
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint, { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

/**
 * POST request helper
 */
export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

/**
 * PUT request helper
 */
export async function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint, { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

// ─── Chatbot (unauthenticated, separate service) ──────────────────────────────

export type ChatbotSource = {
  title: string;
  category: string;
};

export type ChatbotAskResponse = {
  answer: string;
  sources: ChatbotSource[];
};

export async function askChatbot(question: string): Promise<ChatbotAskResponse> {
  const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL || "http://localhost:8002";

  const response = await fetch(`${chatbotUrl}/chatbot/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Chatbot request failed: ${response.status} ${response.statusText} — ${errorText}`
    );
  }

  return response.json();
}