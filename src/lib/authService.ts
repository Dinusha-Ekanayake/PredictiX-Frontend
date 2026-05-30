/**
 * Authentication API Service
 * Handles login, register, token refresh, and logout
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    user_name: string;
    role: string;
    full_name: string;
    employee_id?: string;
    warehouse_id?: string;
    department_id?: string;
  };
}

interface RegisterPayload {
  email: string;
  password: string;
  user_name: string;
  full_name: string;
  contact_no?: string;
}

interface LoginPayload {
  email: string;
  password: string;
  role?: string;
}

/**
 * Login user - returns JWT tokens + user info
 */
export async function login({ email, password, role }: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: role || "user" }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
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
    const error = await response.json();
    throw new Error(error.detail || "Registration failed");
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(refreshToken: string): Promise<{ access_token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  return response.json();
}

/**
 * Store auth tokens and user info in localStorage
 */
export function storeAuthSession(tokens: LoginResponse) {
  localStorage.setItem("predictix.access_token", tokens.access_token);
  localStorage.setItem("predictix.refresh_token", tokens.refresh_token);
  localStorage.setItem("predictix.user", JSON.stringify(tokens.user));
  localStorage.setItem("predictix.user.role", tokens.user.role.toUpperCase());
  localStorage.setItem("predictix.user.email", tokens.user.email);
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem("predictix.access_token");
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem("predictix.refresh_token");
}

/**
 * Get stored user info
 */
export function getUser(): any | null {
  const userStr = localStorage.getItem("predictix.user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Clear all auth data (logout)
 */
export function logout() {
  localStorage.removeItem("predictix.access_token");
  localStorage.removeItem("predictix.refresh_token");
  localStorage.removeItem("predictix.user");
  localStorage.removeItem("predictix.user.role");
  localStorage.removeItem("predictix.user.email");
}

/**
 * Check if user is authenticated (has access token)
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Get user role (lowercase)
 */
export function getUserRole(): string | null {
  const user = getUser();
  return user?.role || null;
}

/**
 * Check if current user is admin
 */
export function isAdmin(): boolean {
  const role = getUserRole();
  return role?.toLowerCase() === "admin";
}

/**
 * Check if current user is regular user
 */
export function isUserRole(): boolean {
  const role = getUserRole();
  return role?.toLowerCase() === "user";
}
