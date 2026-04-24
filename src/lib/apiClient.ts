/**
 * Authenticated API Client
 * Automatically attaches Bearer token to all requests
 * Handles token refresh on 401 errors
 */

import { getAccessToken, getRefreshToken, storeAuthSession, logout } from "./authService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Fetch wrapper with automatic JWT token attachment and refresh
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  // Build headers with auth token
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // First attempt
  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401 (Unauthorized), try to refresh token
  if (response.status === 401) {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        // Try to refresh the access token
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newAccessToken = data.access_token;

          // Store new token
          const user = JSON.parse(localStorage.getItem("predictix.user") || "{}");
          storeAuthSession({
            access_token: newAccessToken,
            refresh_token: refreshToken,
            token_type: "bearer",
            user,
          });

          // Retry original request with new token
          headers["Authorization"] = `Bearer ${newAccessToken}`;
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          // Refresh failed - logout user
          logout();
          window.location.href = "/login";
          throw new Error("Session expired. Please login again.");
        }
      } catch (error) {
        logout();
        window.location.href = "/login";
        throw error;
      }
    } else {
      // No refresh token - logout
      logout();
      window.location.href = "/login";
      throw new Error("Not authenticated. Please login.");
    }
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
export async function apiPost<T>(endpoint: string, body: any): Promise<T> {
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
export async function apiPut<T>(endpoint: string, body: any): Promise<T> {
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

export type ChatbotSource = {
  title: string;
  category: string;
};

export type ChatbotAskResponse = {
  answer: string;
  sources: ChatbotSource[];
};

export async function askChatbot(question: string): Promise<ChatbotAskResponse> {
  const url = "http://localhost:8002/chatbot/ask";
  
  console.log("[API] Chatbot Request:", {
    url,
    method: "POST",
    body: { question },
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    console.log("[API] Chatbot Response Status:", response.status, response.statusText);
    console.log("[API] Chatbot Response Headers:", {
      contentType: response.headers.get("content-type"),
      corsOrigin: response.headers.get("access-control-allow-origin"),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API] Chatbot Error Response:", errorText);
      throw new Error(`Chatbot request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[API] Chatbot Response Data:", data);
    return data;
  } catch (error) {
    console.error("[API] Chatbot Fetch Error:", error);
    if (error instanceof TypeError) {
      console.error("[API] Network error - Backend might not be reachable");
    }
    throw error;
  }
}
