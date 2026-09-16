/**
 * Authentication API Service
 * Handles login, token storage, and session management.
 */

import { invalidateMyProfile } from "@/lib/api/userProfileApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WarehouseOption {
  id: string;
  name: string;
  code: string;
  city?: string | null;
}

/** Shape returned by POST /auth/login */
export interface LoginResponse {
  access_token?: string | null;
  token_type: string;
  user_id?: string | null;
  email?: string | null;
  role?: string | null;
  full_name?: string | null;
  warehouse_id?: string | null;
  warehouse_name?: string | null;
  avatar_url?: string | null;
  // Super-admin step-1 fields
  requires_warehouse_selection: boolean;
  selection_token?: string | null;
  warehouses?: WarehouseOption[] | null;
}

/** Normalised user stored in localStorage */
export interface StoredUser {
  id: string;
  email: string;
  role: string;       // uppercase: "ADMIN" | "USER" | "SUPER_ADMIN"
  full_name: string;
  warehouse_id?: string;
  warehouse_name?: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** Step 1, email + password only. Role is detected by the backend. */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Login failed. Please check your credentials.");
  }

  return response.json();
}

/** Step 2 (super_admin only), exchange selection_token + warehouse_id for a full JWT. */
export async function selectWarehouse(
  selectionToken: string,
  warehouseId: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login/select-warehouse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selection_token: selectionToken, warehouse_id: warehouseId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Warehouse selection failed. Please try again.");
  }

  return response.json();
}

/**
 * Fire-and-forget ping to wake the PredictiX Gradio Space (ticket
 * categorization + priority) before it's actually needed, so the first real
 * inference call doesn't pay the ~20-60s cold-start penalty.
 *
 * No auth required (there's no session yet when this fires from the login
 * page) and callers never await the result, a slow/failed ping must never
 * block or affect the login flow.
 */
export function warmupInferenceSpace(): void {
  fetch(`${API_BASE_URL}/warmup/inference-space`, { method: "POST" }).catch(() => {
    // Intentionally silent, warmup is best-effort and must never surface an error.
  });
}

// ─── Session helpers ──────────────────────────────────────────────────────────

/**
 * Persist a completed login response to localStorage.
 * Only call this when access_token is present (not after step-1 super_admin).
 */
export function storeAuthSession(data: LoginResponse): void {
  if (!data.access_token || !data.user_id || !data.email || !data.role) {
    throw new Error("Cannot store an incomplete auth session.");
  }

  const user: StoredUser = {
    id: data.user_id,
    email: data.email,
    role: data.role.toUpperCase(),
    full_name: data.full_name ?? data.email,
    warehouse_id: data.warehouse_id ?? undefined,
    warehouse_name: data.warehouse_name ?? undefined,
  };

  localStorage.setItem("predictix.access_token", data.access_token);
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("predictix.user", JSON.stringify(user));
  localStorage.setItem("predictix.user.role", user.role);
  localStorage.setItem("predictix.user.email", user.email);
  localStorage.setItem("predictix.user.id", user.id);
  localStorage.setItem("predictix.user.name", user.full_name);
  if (user.warehouse_id) {
    localStorage.setItem("predictix.user.warehouse_id", user.warehouse_id);
  }
  if (user.warehouse_name) {
    localStorage.setItem("predictix.user.warehouse_name", user.warehouse_name);
  }
  if (data.avatar_url) {
    localStorage.setItem("predictix.avatar_url", data.avatar_url);
  }

  // Any snapshot still on this device belongs to the previous session, a
  // different person, or the same super admin on a different warehouse. Drop it
  // so the chatbot cannot answer the new session from the old one's data. The
  // pages that own these caches repopulate them on their next load.
  clearCachedWarehouseData();
}

/** Return the stored JWT access token, or null. */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("predictix.access_token") ||
    localStorage.getItem("token")
  );
}

/** Return the stored user object, or null. */
export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("predictix.user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

/** Identity/session keys written at login. */
const AUTH_STORAGE_KEYS = [
  "predictix.access_token",
  "token",
  "predictix.user",
  "predictix.user.role",
  "predictix.user.email",
  "predictix.user.id",
  "predictix.user.name",
  "predictix.user.warehouse_id",
  "predictix.user.warehouse_name",
  "predictix.avatar_url",
] as const;

/**
 * Snapshots of warehouse data cached by the dashboard and assets pages.
 *
 * These are not decoration: FloatingChatbot reads them and sends them to the
 * agent as `frontend_context`, so whatever is here becomes the material the
 * assistant answers from. They must be cleared whenever the viewer or the
 * viewed warehouse changes. Clearing only the identity keys above would leave
 * them behind, so on a shared machine the next person to sign in would get the
 * previous admin's figures in their chatbot context, and a super admin
 * switching sites would keep answering from the warehouse they just left.
 */
export const CACHED_DATA_STORAGE_KEYS = [
  "predictix.cached_dashboard_data",
  "predictix.cached_asset_stats",
  "predictix.cached_asset_analytics",
] as const;

/** Drop cached warehouse snapshots without touching the session. */
export function clearCachedWarehouseData(): void {
  if (typeof window === "undefined") return;
  for (const key of CACHED_DATA_STORAGE_KEYS) localStorage.removeItem(key);
}

/** Remove all auth data and any cached warehouse snapshots (logout). */
export function logout(): void {
  if (typeof window === "undefined") return;
  for (const key of AUTH_STORAGE_KEYS) localStorage.removeItem(key);
  clearCachedWarehouseData();
  // The profile cache lives in module memory, not localStorage, so clearing
  // storage alone would leave the previous account's name and role readable by
  // whoever signs in next.
  invalidateMyProfile();
}

/** True if a JWT is present in localStorage. */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/** Return the stored role (uppercase), or null. */
export function getUserRole(): string | null {
  return getUser()?.role ?? null;
}

/** True if the stored role is ADMIN or SUPER_ADMIN. */
export function isAdmin(): boolean {
  const r = getUserRole();
  return r === "ADMIN" || r === "SUPER_ADMIN";
}

/** True if the stored role is USER. */
export function isUserRole(): boolean {
  return getUserRole() === "USER";
}

/** Return the stored active warehouse ID. */
export function getActiveWarehouseId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("predictix.user.warehouse_id");
}
