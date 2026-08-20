"use client";

/**
 * Client-side route guard.
 * Since the JWT lives in localStorage (not cookies), Next.js middleware can't
 * see it, so protection is enforced here. Wrap protected layouts with this.
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
  requiredRole?: "ADMIN" | "USER" | "SUPER_ADMIN";
};

const AUTH_GUARD_STAGES = ["Verifying session…", "Checking permissions…"];

export default function AuthGuard({ children, requiredRole }: Props) {
  const router = useRouter();
  const [authorized, setAuthorized] = React.useState(false);
  const [checkProgress, setCheckProgress] = React.useState(0);

  React.useEffect(() => {
    setCheckProgress(50);

    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const role = getUserRole(); // returns e.g. "ADMIN", "SUPER_ADMIN", or "USER"
    if (requiredRole) {
      if (requiredRole === "ADMIN" && (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
        router.replace("/user/dashboard");
        return;
      } else if (requiredRole === "USER" && role !== "USER") {
        router.replace("/admin/dashboard");
        return;
      }
    }

    setCheckProgress(100);
    setAuthorized(true);
  }, [router, requiredRole]);

  if (!authorized) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <PredictiXLoader progress={checkProgress} stages={AUTH_GUARD_STAGES} />
      </div>
    );
  }

  return <>{children}</>;
}
