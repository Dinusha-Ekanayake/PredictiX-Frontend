"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  Clock,
  Gauge,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
  Timer,
  Inbox,
} from "lucide-react";
import type {
  SurvivalSummary,
  SurvivalComponentSummary,
  SurvivalWatchlistItem,
} from "@/lib/warehouseService";

interface Props {
  data?: SurvivalSummary | null;
  isLoading?: boolean;
}

// ── RUL urgency → colour band ─────────────────────────────────────
function rulBand(days: number | null) {
  if (days == null) return { bar: "#94a3b8", text: "#64748b", chip: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", label: "No data" };
  if (days <= 30) return { bar: "#ef4444", text: "#dc2626", chip: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400", label: "Critical" };
  if (days <= 90) return { bar: "#f59e0b", text: "#d97706", chip: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", label: "Watch" };
  if (days <= 180) return { bar: "#0ea5e9", text: "#0284c7", chip: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400", label: "Plan" };
  return { bar: "#10b981", text: "#059669", chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", label: "Healthy" };
}

function riskChip(risk: string) {
  const r = risk.toLowerCase();
  if (r === "high") return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50";
  if (r === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
}

// RUL → bar width on a log-ish scale capped at the 180-day horizon.
function rulWidth(days: number | null) {
  if (days == null) return 0;
  return Math.max(4, Math.min(100, (days / 180) * 100));
}

function fmtRul(days: number | null) {
  if (days == null) return "—";
  if (days < 1) return "<1d";
  if (days >= 365) return `${(days / 365).toFixed(1)}y`;
  if (days >= 90) return `${Math.round(days)}d`;
  return `${days.toFixed(days < 10 ? 1 : 0)}d`;
}

const COMPONENT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Brake: ShieldAlert,
  Tire: Gauge,
  Battery: Activity,
  Oil: Timer,
  Hydraulic: HeartPulse,
};

export default function WarehouseSurvivalAnalysis({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-teal-500" /> FRSO Survival Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-xl animate-pulse bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state — backend unreachable or no critical assets scored. Show an
  // informative card rather than silently hiding the feature.
  if (!data || !data.component_summary?.length) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-teal-500" /> FRSO Component Survival Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3">
              <Inbox className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No survival analysis available</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              This appears once the backend has scored at-risk assets with the Weibull AFT models.
              Check that the backend is running and that low-health predictions exist.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { assets_analyzed, horizon_days, component_summary, watchlist, generated_at } = data;

  // Human-friendly "last analyzed" label from the backend timestamp.
  const lastAnalyzed = (() => {
    if (!generated_at) return null;
    const d = new Date(generated_at);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  })();

  // ── Derived headline metrics (richer than the PDF) ──
  const totalAtRisk30 = component_summary.reduce((s, c) => s + (c.at_risk_30d || 0), 0);
  const highRiskCount = watchlist.filter((w) => w.risk.toLowerCase() === "high").length;

  // Most urgent component = lowest avg RUL (ignoring null)
  const ranked = [...component_summary]
    .filter((c) => c.avg_rul_days != null)
    .sort((a, b) => (a.avg_rul_days as number) - (b.avg_rul_days as number));
  const mostUrgent = ranked[0];

  // Fleet Risk Index: share of component-checks failing within 30 days (0–100)
  const totalScored = component_summary.reduce((s, c) => s + (c.assets_scored || 0), 0);
  const riskIndex = totalScored > 0 ? Math.round((totalAtRisk30 / totalScored) * 100) : 0;
  const riskBand = riskIndex >= 60 ? rulBand(20) : riskIndex >= 30 ? rulBand(60) : rulBand(120);

  const stats = [
    { label: "Assets Analyzed", value: assets_analyzed, sub: `over ${horizon_days}-day horizon`, icon: Activity, tint: "text-sky-500" },
    { label: "Critical (<30d)", value: totalAtRisk30, sub: "component RULs expiring", icon: AlertTriangle, tint: "text-rose-500" },
    { label: "High-Risk Assets", value: highRiskCount, sub: "on the watchlist", icon: ShieldAlert, tint: "text-amber-500" },
    { label: "Most Urgent", value: mostUrgent?.component ?? "—", sub: mostUrgent ? `avg ${fmtRul(mostUrgent.avg_rul_days)} RUL` : "no data", icon: TrendingDown, tint: "text-fuchsia-500" },
  ];

  return (
    <Card className="rounded-2xl overflow-hidden border-teal-100/60 dark:border-teal-900/30">
      {/* Gradient header strip */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-transparent px-6 py-4 border-b border-teal-100/50 dark:border-teal-900/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-teal-500/15 p-2">
              <HeartPulse className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-tight">FRSO Component Survival Analysis</h3>
              <p className="text-xs text-muted-foreground">Weibull Accelerated Failure Time (AFT) · predicted Remaining Useful Life</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastAnalyzed && (
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                Last analyzed {lastAnalyzed}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-400">
              <Clock className="h-3.5 w-3.5" /> {horizon_days}-day horizon
            </span>
          </div>
        </div>
      </div>

      <CardContent className="space-y-6 pt-6">
        {/* ── Headline stat tiles ── */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, sub, icon: Icon, tint }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                <Icon className={`h-4 w-4 ${tint}`} />
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Fleet Risk Index gauge bar ── */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold flex items-center gap-2">
              <Gauge className="h-4 w-4 text-teal-500" /> Fleet Survival Risk Index
            </span>
            <span className="text-sm font-bold" style={{ color: riskBand.text }}>{riskIndex}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${riskIndex}%`, backgroundColor: riskBand.bar }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Share of scored components with median RUL under 30 days. Higher means more of the fleet needs near-term intervention.
          </p>
        </div>

        {/* ── Component RUL cards ── */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-500" /> Component RUL Summary
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {component_summary.map((c: SurvivalComponentSummary) => {
              const band = rulBand(c.avg_rul_days);
              const Icon = COMPONENT_ICON[c.component] ?? Activity;
              return (
                <div
                  key={c.component}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5" /> {c.component}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${band.chip}`}>{band.label}</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold" style={{ color: band.text }}>{fmtRul(c.avg_rul_days)}</span>
                    <span className="text-[11px] text-muted-foreground ml-1">avg RUL</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${rulWidth(c.avg_rul_days)}%`, backgroundColor: band.bar }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="text-rose-600 dark:text-rose-400 font-medium">{c.at_risk_30d} &lt;30d</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">{c.at_risk_90d} &lt;90d</span>
                    <span>{c.assets_scored} scored</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Soonest-failing watchlist ── */}
        {watchlist.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" /> Soonest-Failing Watchlist
              <span className="text-xs font-normal text-muted-foreground">— prioritise these for inspection</span>
            </h4>
            <div className="space-y-2">
              {watchlist.slice(0, 10).map((w: SurvivalWatchlistItem, i) => {
                const band = rulBand(w.rul_days);
                return (
                  <div
                    key={`${w.asset}-${w.component}-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 px-3 py-2.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200/70 dark:bg-slate-700/70 text-xs font-bold text-slate-600 dark:text-slate-300">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{w.asset}</span>
                        <span className="text-xs text-muted-foreground">· {w.component}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${rulWidth(w.rul_days)}%`, backgroundColor: band.bar }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold" style={{ color: band.text }}>{fmtRul(w.rul_days)}</div>
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${riskChip(w.risk)}`}>
                        {w.risk}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Insight footer ── */}
        <div className="rounded-xl border border-teal-100 dark:border-teal-900/40 bg-teal-50/40 dark:bg-teal-950/10 px-4 py-3">
          <p className="text-sm text-teal-800 dark:text-teal-300">
            <span className="font-semibold">Survival-driven scheduling:</span>{" "}
            where a component&apos;s median RUL falls below its statutory/OEM service interval, bring the inspection
            forward. {mostUrgent && (
              <>
                <span className="font-semibold">{mostUrgent.component}</span> is the fleet&apos;s most urgent system
                (avg {fmtRul(mostUrgent.avg_rul_days)} RUL){highRiskCount > 0 && <> with <span className="font-semibold">{highRiskCount}</span> high-risk asset{highRiskCount !== 1 ? "s" : ""}</>} — act first.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
