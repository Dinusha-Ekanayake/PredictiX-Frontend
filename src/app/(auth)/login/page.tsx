"use client";

import * as React from "react";

import AntigravityDotsBackground from "@/components/background/AntigravityDotsBackground";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import { useMinDelay } from "@/hooks/useMinDelay";
import { useNavRouter } from "@/components/navigation/useNavRouter";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import PredictiXLogo from "@/components/brand/PredictiXLogo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import {
  login,
  selectWarehouse,
  storeAuthSession,
  type LoginResponse,
  type WarehouseOption,
} from "@/lib/authService";
import { supabase } from "@/lib/supabaseBrowserClient";

// ─── Background decoration ────────────────────────────────────────────────────

function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {/* Light mode blobs */}
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
      {/* Dark mode blobs — subtle, matches true-black OLED theme */}
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
      {/* Diagonal sheen */}
      <div
        className="absolute -top-32 left-[-25%] w-[150%] rotate-[-10deg] bg-linear-to-r from-transparent via-white/40 to-transparent blur-2xl dark:via-white/[0.04]"
        style={{ height: 520 }}
      />
      {/* Noise */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useNavRouter();
  const ready = useMinDelay(2000);

  // Step-1 state
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  // Step-2 state (super_admin warehouse selection)
  const [step, setStep] = React.useState<"credentials" | "warehouse">("credentials");
  const [selectionToken, setSelectionToken] = React.useState("");
  const [warehouses, setWarehouses] = React.useState<WarehouseOption[]>([]);
  const [warehouseId, setWarehouseId] = React.useState("");
  const [superAdminName, setSuperAdminName] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      
      const errorParam = searchParams.get("error");
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      if (searchParams.get("oauth_super_admin") === "true") {
        const stored = sessionStorage.getItem("predictix.google_oauth_super_admin");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setSelectionToken(parsed.selectionToken);
            setSuperAdminName(parsed.superAdminName);
            setWarehouses(parsed.warehouses || []);
            setStep("warehouse");
            sessionStorage.removeItem("predictix.google_oauth_super_admin");
          } catch (e) {
            console.error("Failed to parse stored Google OAuth super admin state:", e);
          }
        }
      }
    }
  }, []);

  function redirectAfterLogin(role: string) {
    const r = role.toUpperCase();
    if (r === "ADMIN" || r === "SUPER_ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  }

  async function onGoogleLogin() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      if (!supabase) {
        throw new Error("Supabase is not configured on the frontend.");
      }
      const redirectTo = `${window.location.origin}/login/callback`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate Google sign in.");
      setIsSubmitting(false);
    }
  }

  // ── Step 1: credential submit ──────────────────────────────────────────────

  async function onCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const data: LoginResponse = await login(email.trim().toLowerCase(), password);

      if (data.requires_warehouse_selection) {
        // Super admin: move to step 2
        setSelectionToken(data.selection_token ?? "");
        setWarehouses(data.warehouses ?? []);
        setSuperAdminName(data.full_name ?? "");
        setStep("warehouse");
      } else {
        // User or admin: done
        storeAuthSession(data);
        redirectAfterLogin(data.role ?? "user");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Step 2: warehouse selection submit ────────────────────────────────────

  async function onWarehouseSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!warehouseId || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const data: LoginResponse = await selectWarehouse(selectionToken, warehouseId);
      storeAuthSession(data);
      redirectAfterLogin("super_admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select warehouse. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function onBackToCredentials() {
    setStep("credentials");
    setSelectionToken("");
    setWarehouses([]);
    setWarehouseId("");
    setError("");
  }

  // ── Loader screen ──────────────────────────────────────────────────────────

  if (!ready) {
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
          <PredictiXLoader label="Preparing log in…" />
        </div>
      </main>
    );
  }

  // ── Login screen ───────────────────────────────────────────────────────────

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-background">
      <BackgroundBlobs />

      <AntigravityDotsBackground
        className="pointer-events-none absolute inset-0 z-1"
        dotSpacing={22}
        dotRadius={0.9}
        dotAlpha={0.5}
        baseVisibility={0.055}
        intensity={1.25}
        influenceRadius={320}
        blueBoost={0.35}
      />

      <div className="absolute right-4 top-4 z-30">
        <ThemeToggle />
      </div>

      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">

          {/* Left — hero text */}
          <section className="hidden lg:flex flex-col justify-center">
            <PredictiXLogo size={72} />
            <h2 className="mt-10 text-4xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-foreground">
              AI-Powered Predictive Maintenance &amp; Smart Ticket Categorization
              for Asset Management
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-muted-foreground">
              Monitor asset health, predict failures, and manage maintenance
              tickets efficiently — all in one intelligent platform.
            </p>
          </section>

          {/* Right — login card */}
          <section className="flex items-center justify-center">
            <Card className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm dark:border-border dark:bg-card/80">
              <CardHeader className="space-y-3">
                <div className="lg:hidden">
                  <PredictiXLogo size={48} />
                </div>
                <div>
                  <h2 className="text-2xl font-medium tracking-[-0.015em] text-slate-900 dark:text-foreground">
                    {step === "warehouse" ? "Select warehouse" : "Log in"}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-muted-foreground">
                    {step === "warehouse"
                      ? `Welcome, ${superAdminName || "Super Admin"}. Choose the warehouse you want to manage.`
                      : "Enter your email and password to continue."}
                  </p>
                </div>
              </CardHeader>

              <CardContent>

                {/* ── Step 1: Credentials ─────────────────────────────────── */}
                {step === "credentials" && (
                  <form onSubmit={onCredentialsSubmit} className="space-y-5" aria-busy={isSubmitting}>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-foreground">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="h-11"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-slate-900 dark:text-foreground">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="h-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        disabled={isSubmitting}
                      />
                    </div>

                    {error && (
                      <p role="alert" className="text-sm font-medium text-red-500">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="h-11 w-full rounded-xl"
                      disabled={!email.trim() || !password.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Logging in…" : "Log in"}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-4 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-border" />
                      </div>
                      <span className="relative bg-white px-3 text-xs text-slate-500 uppercase tracking-wider dark:bg-card/90 dark:text-muted-foreground">
                        Or continue with
                      </span>
                    </div>

                    {/* Google Auth Button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onGoogleLogin}
                      className="h-11 w-full rounded-xl flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] transition-all duration-200 dark:border-border dark:bg-card dark:hover:bg-muted dark:hover:text-foreground"
                      disabled={isSubmitting}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </Button>

                    {/* Dev credentials hint */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-border dark:bg-muted dark:text-muted-foreground">
                      <div className="font-medium text-slate-800 dark:text-foreground mb-1">Dev accounts</div>
                      <div><span className="font-medium">Super Admin:</span> super.admin1@lankalogix.lk / super</div>
                      <div><span className="font-medium">Admin:</span> anjali.warnakulasuriya.adm1@lankalogix.lk / admin</div>
                      <div><span className="font-medium">User:</span> nuwan.gunasekara.tra1@lankalogix.lk / user</div>
                      <div className="mt-1 text-slate-500">Other seeded accounts: <span className="font-mono">Predictix@123</span></div>
                    </div>

                    <p className="text-center text-xs text-slate-500 dark:text-muted-foreground">
                      © {new Date().getFullYear()} PredictiX
                    </p>
                  </form>
                )}

                {/* ── Step 2: Warehouse selection (super_admin only) ──────── */}
                {step === "warehouse" && (
                  <form onSubmit={onWarehouseSubmit} className="space-y-5" aria-busy={isSubmitting}>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-900 dark:text-foreground">
                        Warehouse
                      </Label>
                      <Select
                        value={warehouseId}
                        onValueChange={setWarehouseId}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-11 w-full font-normal bg-white dark:bg-background">
                          <SelectValue placeholder="Choose a warehouse…" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name}{w.city ? ` — ${w.city}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {error && (
                      <p role="alert" className="text-sm font-medium text-red-500">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="h-11 w-full rounded-xl"
                      disabled={!warehouseId || isSubmitting}
                    >
                      {isSubmitting ? "Logging in…" : "Continue"}
                    </Button>

                    <button
                      type="button"
                      onClick={onBackToCredentials}
                      className="w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:text-muted-foreground dark:hover:text-foreground transition-colors"
                      disabled={isSubmitting}
                    >
                      ← Back
                    </button>

                    <p className="text-center text-xs text-slate-500 dark:text-muted-foreground">
                      © {new Date().getFullYear()} PredictiX
                    </p>
                  </form>
                )}

              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </main>
  );
}
