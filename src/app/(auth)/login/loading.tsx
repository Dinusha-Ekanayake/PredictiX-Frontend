import PredictiXLoader from "@/components/loading/PredictiXLoader";

export default function Loading() {
  return (
    <main className="fixed inset-0 z-50 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-56 -left-56 h-225 w-225 rounded-full bg-sky-200/60 blur-[140px] float-slow-1 dark:hidden" />
        <div className="absolute top-1/3 left-1/2 h-225 w-225 -translate-x-1/2 rounded-full bg-violet-200/50 blur-[160px] float-slow-2 dark:hidden" />
        <div className="absolute -bottom-56 -right-56 h-225 w-225 rounded-full bg-white/70 blur-[160px] float-slow-3 dark:hidden" />

        <div className="hidden dark:block absolute -top-56 -left-56 h-225 w-225 rounded-full bg-sky-500/10 blur-[160px] float-slow-1" />
        <div className="hidden dark:block absolute top-1/3 left-1/2 h-22525 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[180px] float-slow-2" />
        <div className="hidden dark:block absolute -bottom-56 -right-56 h-225 w-225 rounded-full bg-white/5 blur-[180px] float-slow-3" />

        <div className="absolute -top-32 left-[-25%] h-130 w-[150%] rotate-[-10deg] bg-linear-to-r from-transparent via-white/40 to-transparent blur-2xl dark:via-white/10" />

        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <PredictiXLoader label="Preparing sign in…" />
      </div>
    </main>
  );
}
