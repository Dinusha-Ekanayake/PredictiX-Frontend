import * as React from "react";

/**
 * Shared page title banner, the admin dashboard's hero design, reused across
 * admin + user sections. Carries both light and dark (OLED) gradient variants.
 */
type PageHeroProps = {
  /** Breadcrumb trail, e.g. ["PredictiX", "Admin", "Tickets"]. */
  crumbs?: string[];
  title: string;
  subtitle?: string;
  /** Show the pulsing "Live" badge next to the subtitle. */
  live?: boolean;
  /** Optional right-aligned content (actions, stat pills, etc.). */
  right?: React.ReactNode;
};

export default function PageHero({ crumbs, title, subtitle, live, right }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 dark:border-white/10 dark:bg-white/2">
      {/* Gradient wash, light (violet/sky) + dark (OLED: faint violet sheen on black) */}
      <div className="absolute inset-0 bg-linear-to-br from-violet-50/90 via-white/70 to-sky-50/80 dark:from-violet-500/8 dark:via-white/2 dark:to-transparent pointer-events-none" />

      <div className="relative px-7 py-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {crumbs && crumbs.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              {crumbs.map((c, i) => (
                <React.Fragment key={`${c}-${i}`}>
                  {i > 0 && <span className="text-muted-foreground/30 text-xs font-light">/</span>}
                  <span
                    className={
                      i === 0
                        ? "text-[10px] font-bold tracking-[0.14em] uppercase text-violet-500 dark:text-violet-400"
                        : "text-[10px] tracking-widest uppercase text-muted-foreground/70"
                    }
                  >
                    {c}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}

          <h1 className="text-[26px] font-semibold tracking-[-0.025em] leading-none text-foreground">
            {title}
          </h1>

          {(subtitle || live) && (
            <div className="flex items-center gap-2.5 mt-2.5">
              {subtitle && (
                <p className="text-[12px] text-muted-foreground leading-tight max-w-xl">{subtitle}</p>
              )}
              {live && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
          )}
        </div>

        {right && <div className="flex flex-col items-start gap-2.5 sm:items-end shrink-0">{right}</div>}
      </div>
    </div>
  );
}
