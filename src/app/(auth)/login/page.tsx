// "use client";

// import * as React from "react";

// import AntigravityDotsBackground from "@/components/background/AntigravityDotsBackground";
// import PredictiXLoader from "@/components/loading/PredictiXLoader";
// import { useMinDelay } from "@/hooks/useMinDelay";
// import { useNavRouter } from "@/components/navigation/useNavRouter";

// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// import RoleSelectCards, { type Role } from "@/components/auth/RoleSelectCards";
// import PredictiXLogo from "@/components/brand/PredictiXLogo";
// import ThemeToggle from "@/components/theme/ThemeToggle";
// import { login, storeAuthSession } from "@/lib/authService";

// function BackgroundBlobs() {
//   return (
//     <div className="pointer-events-none absolute inset-0 z-0">
//       <div className="absolute -top-56 -left-56 h-225 w-225 rounded-full bg-sky-200/60 blur-[140px] float-slow-1 dark:hidden" />
//       <div className="absolute top-1/3 left-1/2 h-225 w-[900px] -translate-x-1/2 rounded-full bg-violet-200/50 blur-[160px] float-slow-2 dark:hidden" />
//       <div className="absolute -bottom-56 -right-56 h-[900px] w-225 rounded-full bg-white/70 blur-[160px] float-slow-3 dark:hidden" />

//       <div className="hidden dark:block absolute -top-56 -left-56 h-225 w-225 rounded-full bg-sky-500/10 blur-[160px] float-slow-1" />
//       <div className="hidden dark:block absolute top-1/3 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[180px] float-slow-2" />
//       <div className="hidden dark:block absolute -bottom-56 -right-56 h-[900px] w-[900px] rounded-full bg-white/5 blur-[180px] float-slow-3" />

//       <div className="absolute -top-32 left-[-25%] h-[520px] w-[150%] rotate-[-10deg] bg-linear-to-r from-transparent via-white/40 to-transparent blur-2xl dark:via-white/10" />

//       <div
//         className="absolute inset-0 opacity-[0.05] dark:opacity-[0.06]"
//         style={{
//           backgroundImage:
//             "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E\")",
//         }}
//       />
//     </div>
//   );
// }

// export default function LoginPage() {
//   const router = useNavRouter();
//   const ready = useMinDelay(2000);

//   const [role, setRole] = React.useState<Role | "">("");
//   const [email, setEmail] = React.useState("");
//   const [password, setPassword] = React.useState("");
//   const [isSubmitting, setIsSubmitting] = React.useState(false);
//   const [error, setError] = React.useState("");

//   const canSubmit =
//     role !== "" &&
//     email.trim().length > 0 &&
//     password.trim().length > 0 &&
//     !isSubmitting;

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!canSubmit) return;

//     setIsSubmitting(true);
//     setError("");

//     try {
//       const data = await login({ email: email.trim().toLowerCase(), password });
//       storeAuthSession(data);

//       if (data.user.role.toUpperCase() === "ADMIN") {
//         router.push("/admin/dashboard");
//       } else {
//         router.push("/user/users");
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   if (!ready) {
//     return (
//       <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
//         <BackgroundBlobs />

//         <AntigravityDotsBackground
//           className="pointer-events-none absolute inset-0 z-[1]"
//           dotSpacing={22}
//           dotRadius={0.9}
//           dotAlpha={0.2}
//           baseVisibility={0.055}
//           intensity={1.2}
//           influenceRadius={300}
//           blueBoost={0.24}
//         />

//         <div className="relative z-20 px-4">
//           <PredictiXLoader label="Preparing log in…" />
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
//       <BackgroundBlobs />

//       <AntigravityDotsBackground
//         className="pointer-events-none absolute inset-0 z-[1]"
//         dotSpacing={22}
//         dotRadius={0.9}
//         dotAlpha={0.5}
//         baseVisibility={0.055}
//         intensity={1.25}
//         influenceRadius={320}
//         blueBoost={0.35}
//       />

//       <div className="absolute right-4 top-4 z-30">
//         <ThemeToggle />
//       </div>

//       <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12">
//         <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
//           <section className="hidden lg:flex flex-col justify-center">
//             <PredictiXLogo size={72} />

//             <h2 className="mt-10 text-4xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-50">
//               AI-Powered Predictive Maintenance & Smart Ticket Categorization for Asset Management
//             </h2>

//             <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
//               Monitor asset health, predict failures, and manage maintenance tickets efficiently — all in one intelligent platform.
//             </p>
//           </section>

//           <section className="flex items-center justify-center">
//             <Card className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/75">
//               <CardHeader className="space-y-3">
//                 <div className="lg:hidden">
//                   <PredictiXLogo size={48} />
//                 </div>

//                 <div>
//                   <h2 className="text-2xl font-medium tracking-[-0.015em] text-slate-900 dark:text-slate-50">
//                     Log in
//                   </h2>
//                   <p className="text-sm text-slate-600 dark:text-slate-300">
//                     Select your role and enter your credentials.
//                   </p>
//                 </div>
//               </CardHeader>

//               <CardContent>
//                 <form onSubmit={onSubmit} className="space-y-6" aria-busy={isSubmitting}>
//                   <div className="space-y-2">
//                     <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
//                       Role
//                     </Label>
//                     <RoleSelectCards value={role} onChange={setRole} />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-slate-100">
//                       Email
//                     </Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       placeholder="you@example.com"
//                       className="h-11"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       autoComplete="email"
//                       disabled={isSubmitting}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="password" className="text-sm font-medium text-slate-900 dark:text-slate-100">
//                       Password
//                     </Label>
//                     <Input
//                       id="password"
//                       type="password"
//                       placeholder="••••••••"
//                       className="h-11"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       autoComplete="current-password"
//                       disabled={isSubmitting}
//                     />
//                   </div>

//                   {error && (
//                     <p className="text-sm font-medium text-red-500">{error}</p>
//                   )}

//                   <Button type="submit" className="h-11 w-full rounded-xl" disabled={!canSubmit}>
//                     {isSubmitting ? "Logging in..." : "Log in"}
//                   </Button>

//                   <p className="text-center text-xs text-slate-500 dark:text-slate-400">
//                     © {new Date().getFullYear()} PredictiX
//                   </p>
//                 </form>
//               </CardContent>
//             </Card>
//           </section>
//         </div>
//       </div>
//     </main>
//   );
// }

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

import RoleSelectCards, { type Role } from "@/components/auth/RoleSelectCards";
import PredictiXLogo from "@/components/brand/PredictiXLogo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { login, storeAuthSession } from "@/lib/authService";

// ─── Background decoration ────────────────────────────────────────────────────

function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {/* Light mode blobs — use inline style for arbitrary sizes to avoid Tailwind warnings */}
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

      {/* Dark mode blobs */}
      <div
        className="hidden dark:block absolute -top-56 -left-56 rounded-full bg-sky-500/10 blur-[160px] float-slow-1"
        style={{ height: 225, width: 225 }}
      />
      <div
        className="hidden dark:block absolute top-1/3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[180px] float-slow-2"
        style={{ height: 900, width: 900 }}
      />
      <div
        className="hidden dark:block absolute -bottom-56 -right-56 rounded-full bg-white/5 blur-[180px] float-slow-3"
        style={{ height: 900, width: 900 }}
      />

      {/* Diagonal sheen */}
      <div
        className="absolute -top-32 left-[-25%] w-[150%] rotate-[-10deg] bg-linear-to-r from-transparent via-white/40 to-transparent blur-2xl dark:via-white/10"
        style={{ height: 520 }}
      />

      {/* Noise texture */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useNavRouter();
  const ready = useMinDelay(2000);

  const [role, setRole] = React.useState<Role | "">("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const canSubmit =
    role !== "" &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    !isSubmitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Send role to backend so it validates the account type matches
      const data = await login({
        email: email.trim().toLowerCase(),
        password,
        role: role.toUpperCase(),   // "ADMIN" | "USER"
      });

      storeAuthSession(data);

      // Redirect based on role returned by backend (source of truth)
      if (data.role.toUpperCase() === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/user/users");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Loader screen ──────────────────────────────────────────────────────────

  if (!ready) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
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
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
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
            <h2 className="mt-10 text-4xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-50">
              AI-Powered Predictive Maintenance &amp; Smart Ticket Categorization
              for Asset Management
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Monitor asset health, predict failures, and manage maintenance
              tickets efficiently — all in one intelligent platform.
            </p>
          </section>

          {/* Right — login card */}
          <section className="flex items-center justify-center">
            <Card className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/75">
              <CardHeader className="space-y-3">
                <div className="lg:hidden">
                  <PredictiXLogo size={48} />
                </div>
                <div>
                  <h2 className="text-2xl font-medium tracking-[-0.015em] text-slate-900 dark:text-slate-50">
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
                  {/* Role selector */}
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
                      placeholder="you@example.com"
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
                      placeholder="••••••••"
                      className="h-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Error message */}
                  {error && (
                    <p role="alert" className="text-sm font-medium text-red-500">
                      {error}
                    </p>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl"
                    disabled={!canSubmit}
                  >
                    {isSubmitting ? "Logging in…" : "Log in"}
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
