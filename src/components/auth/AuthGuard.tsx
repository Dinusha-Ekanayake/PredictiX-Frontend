"use client";

/**
 * Client-side route guard.
 * Since the JWT lives in localStorage (not cookies), Next.js middleware can't
 * see it — so protection is enforced here. Wrap protected layouts with this.
 *
 * - Not authenticated  → redirect to /login
 * - Wrong role         → redirect to the user's own home area
 * - While checking      → render a loader (prevents protected content flashing)
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole } from "@/lib/authService";
import PredictiXLoader from "@/components/loading/PredictiXLoader";

type Props = {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "USER";
};

export default function AuthGuard({ children, requiredRole }: Props) {
  const router = useRouter();
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const role = getUserRole();
    if (requiredRole && role !== requiredRole) {
      // Logged in but in the wrong area — send to their own home.
      router.replace(role === "ADMIN" ? "/admin/dashboard" : "/user/users");
      return;
    }

    setAuthorized(true);
  }, [router, requiredRole]);

  if (!authorized) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <PredictiXLoader label="Checking access…" />
      </div>
    );
  }

  return <>{children}</>;
}
