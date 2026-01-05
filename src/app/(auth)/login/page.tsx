"use client";

import * as React from "react";

import PredictiXLoader from "@/components/loading/PredictiXLoader";
import { useMinDelay } from "@/hooks/useMinDelay";
import { useNavRouter } from "@/components/navigation/useNavRouter";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import RoleSelectCards, { type Role } from "@/components/auth/RoleSelectCards";
import PredictiXLogo from "@/components/brand/PredictiXLogo";
import ThemeToggle from "@/components/theme/ThemeToggle";

function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Light mode blobs */}
      <div className="absolute -top-56 -left-56 h-[900px] w-[900px] rounded-full bg-sky-200/60 blur-[140px] float-slow-1 dark:hidden" />
      <div className="absolute top-1/3 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-violet-200/50 blur-[160px] float-slow-2 dark:hidden" />
      <div className="absolute -bottom-56 -right-56 h-[900px] w-[900px] rounded-full bg-white/70 blur-[160px] float-slow-3 dark:hidden" />

      {/* Dark mode blobs */}
      <div className="hidden dark:block absolute -top-56 -left-56 h-[900px] w-[900px] rounded-full bg-sky-500/10 blur-[160px] float-slow-1" />
      <div className="hidden dark:block absolute top-1/3 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[180px] float-slow-2" />
      <div className="hidden dark:block absolute -bottom-56 -right-56 h-[900px] w-[900px] rounded-full bg-white/5 blur-[180px] float-slow-3" />

      {/* Diagonal shine */}
      <div className="absolute -top-32 left-[-25%] h-[520px] w-[150%] rotate-[-10deg] bg-gradient-to-r from-transparent via-white/40 to-transparent blur-2xl dark:via-white/10" />

      {/* Optional noise */}
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useNavRouter();

  // ✅ Hook must be inside component
  const ready = useMinDelay(3000);

  const [role, setRole] = React.useState<Role | "">("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canSubmit =
    role !== "" &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    !isSubmitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      console.log({ role, email, password });
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ✅ Always show loader first (minimum delay)
  if (!ready) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <BackgroundBlobs />
        <div className="relative z-10 px-4">
          <PredictiXLoader label="Preparing sign in…" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top-right theme toggle */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background */}
      <BackgroundBlobs />

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Brand Panel */}
          <section className="hidden lg:flex flex-col justify-center">
            <PredictiXLogo size={72} />

            <h2 className="mt-10 text-4xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-50">
              AI-Powered Predictive Maintenance & Smart Ticket Categorization for
              Asset Management
            </h2>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Monitor asset health, predict failures, and manage maintenance
              tickets efficiently — all in one intelligent platform.
            </p>
          </section>

          {/* Right Login Card */}
          <section className="flex items-center justify-center">
            <Card className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="space-y-3">
                {/* Mobile logo */}
                <div className="lg:hidden">
                  <PredictiXLogo size={48} />
                </div>

                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    Log in
                  </h2>

                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Select your role and enter your credentials.
                  </p>
                </div>
              </CardHeader>

              <CardContent>
                <form
                  onSubmit={onSubmit}
                  className="space-y-6"
                  aria-busy={isSubmitting}
                >
                  {/* Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Role
                    </Label>
                    <RoleSelectCards value={role} onChange={setRole} />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-900 dark:text-slate-100"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      className="h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-900 dark:text-slate-100"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="h-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl"
                    disabled={!canSubmit}
                  >
                    {isSubmitting ? "Logging in..." : "Log in"}
                  </Button>

                  <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    © {new Date().getFullYear()} PredictiX
                  </p>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
