"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseBrowserClient";

export default function HelpDeskButton() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Don't show on auth pages
  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/(auth)");

  React.useEffect(() => {
    // Check Supabase session
    const checkAuth = async () => {
      try {
        const { data } = await supabase?.auth.getSession() || { data: { session: null } };
        const isAuthenticated = !!data?.session;
        
        // Also check localStorage as fallback (for local auth)
        const userRole = localStorage.getItem("predictix.user.role");
        const isLoggedInStatus = isAuthenticated || !!userRole;
        setIsLoggedIn(isLoggedInStatus);
      } catch (error) {
        console.error("Auth check error:", error);
        const userRole = localStorage.getItem("predictix.user.role");
        setIsLoggedIn(!!userRole);
      } finally {
        setMounted(true);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: authSubscription } = supabase?.auth.onAuthStateChange(() => {
      checkAuth();
    }) || { data: null };

    return () => {
      authSubscription?.subscription?.unsubscribe?.();
    };
  }, []);

  if (!mounted || !isLoggedIn || isAuthPage) {
    return null;
  }

  return (
    <Link href="/help-desk">
      <Button
        className="fixed bottom-8 left-8 rounded-full shadow-lg hover:shadow-xl z-40 bg-primary hover:bg-primary/90"
        size="lg"
      >
        <CircleHelp className="size-5 mr-2" />
        Help Desk
      </Button>
    </Link>
  );
}
