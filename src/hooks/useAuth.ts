/**
 * useAuth Hook - Client-side authentication check
 * Protects routes by checking localStorage and redirecting if not authenticated
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getUserRole, isAdmin, isUserRole } from "@/lib/authService";

interface UseAuthOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireUser?: boolean;
  redirectPath?: string;
}

/**
 * Hook to check authentication and role-based access
 */
export function useAuth({
  requireAuth = true,
  requireAdmin = false,
  requireUser = false,
  redirectPath = "/login",
}: UseAuthOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if authenticated
    if (requireAuth && !isAuthenticated()) {
      router.push(redirectPath);
      return;
    }

    // Check admin role
    if (requireAdmin && !isAdmin()) {
      router.push("/unauthorized");
      return;
    }

    // Check user role
    if (requireUser && !isUserRole()) {
      router.push("/unauthorized");
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [
    requireAuth,
    requireAdmin,
    requireUser,
    redirectPath,
    router,
  ]);

  return { isLoading, isAuthorized };
}

/**
 * Hook to get current user info
 */
export function useUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("predictix.user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    }
  }, []);

  return { user, role: user?.role || null };
}

/**
 * Hook to handle logout
 */
export function useLogout() {
  const router = useRouter();

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem("predictix.access_token");
    localStorage.removeItem("predictix.refresh_token");
    localStorage.removeItem("predictix.user");
    localStorage.removeItem("predictix.user.role");
    localStorage.removeItem("predictix.user.email");

    // Redirect to login
    router.push("/login");
  };

  return logout;
}
