/**
 * Authentication API Service
 * Handles login, token storage, and session management.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Flat shape returned by POST /auth/login */
interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  role: string;       // "admin" | "user"
  full_name: string;
}

/** Normalised user stored in localStorage */
export interface StoredUser {
  id: string;
  email: string;
  role: string;       // uppercase: "ADMIN" | "USER"
  full_name: string;
}

interface LoginPayload {
  email: string;
  password: string;
  role: string;       // "ADMIN" | "USER" — required by backend
}

interface RegisterPayload {
  email: string;
  password: string;
  user_name: string;
  full_name: string;
  contact_no?: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Login — sends email, password AND role to /auth/login.
 * The backend validates that the declared role matches the stored account role.
 */
export async function login({ email, password, role }: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Login failed. Please check your credentials.");
  }

  return response.json();
}

/**
 * Register new user
 */
export async function register(payload: RegisterPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Registration failed.");
  }

  return response.json();
}

// ─── Session helpers ──────────────────────────────────────────────────────────

/**
 * Persist the login response to localStorage.
 * Normalises the flat backend response into a StoredUser object.
 */
export function storeAuthSession(data: LoginResponse): void {
  const user: StoredUser = {
    id: data.user_id,
    email: data.email,
    role: data.role.toUpperCase(),   // always store as uppercase
    full_name: data.full_name,
  };

  // Canonical key + legacy "token" key (read by userProfileApi) — keep both in
  // sync so every consumer finds the JWT regardless of which key it checks.
  localStorage.setItem("predictix.access_token", data.access_token);
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("predictix.user", JSON.stringify(user));
  localStorage.setItem("predictix.user.role", user.role);
  localStorage.setItem("predictix.user.email", user.email);
  localStorage.setItem("predictix.user.id", user.id);
  localStorage.setItem("predictix.user.name", user.full_name);
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

/** Remove all auth data (logout). */
export function logout(): void {
  localStorage.removeItem("predictix.access_token");
  localStorage.removeItem("token");
  localStorage.removeItem("predictix.user");
  localStorage.removeItem("predictix.user.role");
  localStorage.removeItem("predictix.user.email");
  localStorage.removeItem("predictix.user.id");
  localStorage.removeItem("predictix.user.name");
}

/** True if a JWT is present in localStorage. */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/** Return the stored role (uppercase), or null. */
export function getUserRole(): string | null {
  return getUser()?.role ?? null;
}

/** True if the stored role is ADMIN. */
export function isAdmin(): boolean {
  return getUserRole() === "ADMIN";
}

/** True if the stored role is USER. */
export function isUserRole(): boolean {
  return getUserRole() === "USER";
}
