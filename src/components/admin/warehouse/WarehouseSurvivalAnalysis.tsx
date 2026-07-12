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
  Wallet,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
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

// Fixed component order + colour for the risk bar charts.
const COMPONENTS = ["tire", "battery", "hydraulic", "oil", "brake"] as const;
const COMPONENT_COLOR: Record<string, string> = {
  Brake: "#ef4444",
  Tire: "#f59e0b",
  Battery: "#10b981",
  Oil: "#0ea5e9",
  Hydraulic: "#8b5cf6",
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function fmtMoney(n?: number | null) {
  if (n == null) return "—";
  return `LKR ${Math.round(n).toLocaleString()}`;
}

interface RiskTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; avgPct: number; count: number } }>;
  window?: "7d" | "30d";
}

function RiskTooltip({ active, payload, window }: RiskTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-md text-xs">
      <div className="font-semibold" style={{ color: COMPONENT_COLOR[p.name] }}>{p.name}</div>
      <div className="text-muted-foreground">
        Avg P(fail) ≤{window}: <span className="font-semibold text-foreground">{p.avgPct}%</span>
      </div>
      <div className="text-muted-foreground">
        {p.count} asset{p.count === 1 ? "" : "s"} at risk
      </div>
    </div>
  );
}

export default function WarehouseSurvivalAnalysis({ data, isLoading }: Props) {
  // Risk bar-chart carousel: 0 = next 7 days, 1 = next 30 days. Declared before
  // any early return so the hook order stays stable.
  const [slide, setSlide] = React.useState<0 | 1>(0);

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

  const {
    assets_analyzed, horizon_days, component_summary, watchlist, generated_at,
    assets = [], expected_spend_7d, expected_spend_30d,
  } = data;

  // ── Risk bar-chart data: average P(fail) per component + at-risk count ──
  // Average failure probability is taken across the scored critical assets;
  // the count is how many of them have that component failing within the window.
  const buildChart = (window: "7d" | "30d") => {
    const probKey = window === "7d" ? "fail_prob_7d" : "fail_prob_30d";
    return COMPONENTS.map((c) => {
      const name = cap(c);
      const vals = assets
        .map((a) => a.components?.[c]?.[probKey])
        .filter((v): v is number => typeof v === "number");
      const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
      const cs = component_summary.find((x) => x.component.toLowerCase() === c);
      const count = window === "7d" ? cs?.at_risk_7d ?? 0 : cs?.at_risk_30d ?? 0;
      return { name, avgPct: +(avg * 100).toFixed(1), count };
    });
  };

  const slides = [
    {
      key: "7d" as const,
      label: "Next 7 days",
      totalCost: expected_spend_7d,
      data: buildChart("7d"),
    },
    {
      key: "30d" as const,
      label: "Next 30 days (one month)",
      totalCost: expected_spend_30d,
      data: buildChart("30d"),
    },
  ];
  const active = slides[slide];
  const totalFailures = active.data.reduce((s, d) => s + d.count, 0);

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
    { label: "Critical (<30d)", value: totalAtRisk30, sub: "component RULs expiring", icon: AlertTriangle, tint: "text-rose-500" },
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
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

        {/* ── Failure-risk bar-chart carousel (7-day / 30-day) ── */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-teal-500" /> Component Failure Risk — {active.label}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSlide((s) => (s === 0 ? 1 : 0))}
                aria-label="Previous chart"
                className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1">
                {slides.map((s, i) => (
                  <span
                    key={s.key}
                    className={`h-1.5 rounded-full transition-all ${i === slide ? "w-5 bg-teal-500" : "w-1.5 bg-slate-300 dark:bg-slate-600"}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSlide((s) => (s === 0 ? 1 : 0))}
                aria-label="Next chart"
                className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Headline values for this window: total cost + total failures */}
          <div className="flex flex-wrap items-end gap-x-8 gap-y-2 mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Wallet className="h-3 w-3" /> Est. replacement spend
              </div>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{fmtMoney(active.totalCost)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Component failures ({active.key})
              </div>
              <div className="text-2xl font-bold">{totalFailures}</div>
            </div>
          </div>

          {/* Average failure probability per component */}
          <div className="h-64 w-full">
            <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
              <BarChart data={active.data} margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={44} />
                <Tooltip content={<RiskTooltip window={active.key} />} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
                <Bar dataKey="avgPct" radius={[6, 6, 0, 0]} maxBarSize={64} isAnimationActive>
                  {active.data.map((d) => (
                    <Cell key={d.name} fill={COMPONENT_COLOR[d.name]} />
                  ))}
                  <LabelList dataKey="avgPct" position="top" formatter={(value) => `${value}%`} fill="#64748b" fontSize={11} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Descriptive per-component failure counts */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {active.data.map((d) => (
              <div
                key={d.name}
                className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 px-2.5 py-2 text-center"
              >
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold" style={{ color: COMPONENT_COLOR[d.name] }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COMPONENT_COLOR[d.name] }} /> {d.name}
                </div>
                <div className="text-lg font-bold leading-tight mt-0.5">{d.count}</div>
                <div className="text-[10px] text-muted-foreground">
                  {d.count === 1 ? "asset" : "assets"} at risk ≤{active.key}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground mt-3">
            Bars show the average failure probability across the {assets_analyzed} scored critical assets;
            the tiles count how many have each component failing within {active.key === "7d" ? "7 days" : "30 days"}.
            Replacement spend comes from the cost-estimation model. Use the arrows to switch between the 7-day and 30-day view.
          </p>
        </div>


      </CardContent>
    </Card>
  );
}
