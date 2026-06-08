/**
 * useAuth Hook - Client-side authentication check
 * Protects routes by checking localStorage and redirecting if not authenticated
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isAuthenticated,
  isAdmin,
  isUserRole,
  getUser,
  logout as clearSession,
  type StoredUser,
} from "@/lib/authService";

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

    // localStorage is only readable on the client, so this gate runs after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getUser());
  }, []);

  return { user, role: user?.role ?? null };
}

/**
 * Hook to handle logout
 */
export function useLogout() {
  const router = useRouter();

  return () => {
    clearSession();
    router.push("/login");
  };
}
