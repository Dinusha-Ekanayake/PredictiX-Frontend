"use client";

import * as React from "react";
import { useNavRouter } from "@/components/navigation/useNavRouter";
import { supabase } from "@/lib/supabaseBrowserClient";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import AntigravityDotsBackground from "@/components/background/AntigravityDotsBackground";
import { storeAuthSession } from "@/lib/authService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div
        className="absolute -top-56 -left-56 rounded-full bg-sky-200/60 blur-[140px] float-slow-1 dark:hidden"
        style={{ height: 225, width: 225 }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 rounded-full bg-violet-200/50 blur-[160px] float-slow-2 dark:hidden"
        style={{ height: 225, width: 900 }}
      />
      <div
        className="absolute -bottom-56 -right-56 rounded-full bg-white/70 blur-[160px] float-slow-3 dark:hidden"
        style={{ height: 900, width: 225 }}
      />
      <div
        className="hidden dark:block absolute -top-56 -left-56 rounded-full bg-sky-400/5 blur-[160px] float-slow-1"
        style={{ height: 225, width: 225 }}
      />
      <div
        className="hidden dark:block absolute top-1/3 left-1/2 -translate-x-1/2 rounded-full bg-violet-400/6 blur-[180px] float-slow-2"
        style={{ height: 900, width: 900 }}
      />
      <div
        className="hidden dark:block absolute -bottom-56 -right-56 rounded-full bg-white/[0.03] blur-[180px] float-slow-3"
        style={{ height: 900, width: 900 }}
      />
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

export default function LoginCallbackPage() {
  const router = useNavRouter();
  const [statusMessage, setStatusMessage] = React.useState("Verifying your Google session...");
  const processedRef = React.useRef(false);

  React.useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    async function handleAuthCallback() {
      try {
        if (!supabase) {
          throw new Error("Supabase client is not configured.");
        }

        // Wait a small moment to ensure Supabase client parses hash or query params
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Get the current Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          throw new Error("No Google authentication session was found.");
        }

        setStatusMessage("Syncing with PredictiX backend...");

        // Send Supabase session token to PredictiX backend
        const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: session.access_token }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.detail ||
            errData.error ||
            `Backend returned status ${response.status}: Google authentication failed.`
          );
        }

        const loginData = await response.json();

        if (loginData.requires_warehouse_selection) {
          // If user is a super admin requiring warehouse selection:
          // Store the step-1 login data in sessionStorage and redirect to login page
          sessionStorage.setItem(
            "predictix.google_oauth_super_admin",
            JSON.stringify({
              selectionToken: loginData.selection_token,
              superAdminName: loginData.full_name,
              warehouses: loginData.warehouses,
            })
          );
          router.push("/login?oauth_super_admin=true");
        } else {
          // Normal user or admin
          storeAuthSession(loginData);
          const role = (loginData.role || "user").toUpperCase();
          if (role === "ADMIN" || role === "SUPER_ADMIN") {
            router.push("/admin/dashboard");
          } else {
            router.push("/user/dashboard");
          }
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        const errMsg = err?.message || "Failed to log in with Google.";
        router.push(`/login?error=${encodeURIComponent(errMsg)}`);
      }
    }

    handleAuthCallback();
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-background flex items-center justify-center">
      <BackgroundBlobs />
      <AntigravityDotsBackground
        className="pointer-events-none absolute inset-0 z-1"
        dotSpacing={22}
        dotRadius={0.9}
        dotAlpha={0.2}
        baseVisibility={0.055}
        intensity={1.2}
        influenceRadius={300}
        blueBoost={0.24}
      />
      <div className="relative z-20 px-4">
        <PredictiXLoader label={statusMessage} />
      </div>
    </main>
  );
}
