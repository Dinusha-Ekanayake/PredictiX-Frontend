/**
 * RouteGuard Component - Wraps pages to protect them
 * Usage: Wrap your page component with RouteGuard
 * 
 * Example:
 * export default function DashboardPage() {
 *   return <RouteGuard requireAdmin><DashboardContent /></RouteGuard>
 * }
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin, isUserRole } from "@/lib/authService";
import { PredictiXLoader } from "@/components/loading/PredictiXLoader";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireUser?: boolean;
  redirectPath?: string;
}

export function RouteGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireUser = false,
  redirectPath = "/login",
}: RouteGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication
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

    setAuthorized(true);
  }, [requireAuth, requireAdmin, requireUser, redirectPath, router]);

  if (!authorized) {
    return <PredictiXLoader />;
  }

  return <>{children}</>;
}
