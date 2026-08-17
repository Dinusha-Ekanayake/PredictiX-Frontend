"use client";

import * as React from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList,
} from "recharts";
import {
  Activity, AlertTriangle, ArrowUpRight, Bot, Brain,
  ChevronRight, Clock, ExternalLink, Flame, Package,
  RefreshCw, ShieldAlert, Ticket, Wrench,
  Timer, BarChart2, ThumbsUp, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import { useNavRouter } from "@/components/navigation/useNavRouter";
import { healthColor, healthTextClass } from "@/lib/healthBands";
import {
  getAdminDashboard,
  type AdminDashboardData,
  type AlertSeverity,
  type DashboardInsight,
  type InsightTone,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/dashboardService";

// ─── Style maps & helpers ─────────────────────────────────────────────────────

const SEV_DOT: Record<AlertSeverity, string> = { critical: "bg-rose-500 animate-pulse", warning: "bg-amber-400", info: "bg-sky-400" };
const SEV_LABEL: Record<AlertSeverity, string> = { critical: "text-rose-600 dark:text-rose-400", warning: "text-amber-600 dark:text-amber-400", info: "text-sky-600 dark:text-sky-400" };
const SEV_ROW: Record<AlertSeverity, string> = { critical: "hover:bg-rose-50/60 dark:hover:bg-rose-500/5", warning: "hover:bg-amber-50/60 dark:hover:bg-amber-500/5", info: "hover:bg-sky-50/40 dark:hover:bg-sky-500/5" };

const PRI: Record<TicketPriority, string> = {
  critical: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
  high: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  low: "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20",
};
const STA: Record<TicketStatus, string> = {
  in_progress: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  closed: "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20",
  open: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
};

// 5 health bands (Excellent..Critical) + a neutral gray for the "No Data"
// band (assets with no completed prediction yet) appended by the backend —
// keep it visually distinct from every real band, not a wrapped-around reuse.
const DIST_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#f97316", "#ef4444", "#94a3b8"];

const INSIGHT_STYLE: Record<InsightTone, { icon: React.ElementType; color: string; bg: string }> = {
  critical: { icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20" },
  warning: { icon: Timer, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20" },
  info: { icon: BarChart2, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20" },
  positive: { icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" },
};

/** Format an LKR amount compactly (e.g. 2_400_000 → "2.4M"). */
function fmtCompact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

function Chip({ label, cls }: { label: string; cls: string }) {
  return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset", cls)}>{label}</span>;
}

function PieTip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; count: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md"><p className="font-semibold">{d.name}</p><p className="text-muted-foreground">{d.count} assets</p></div>;
}

function CTip({ active, payload, label, fmt }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string; fmt?: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md space-y-1 min-w-27.5">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
          <span className="flex-1">{p.name}</span>
          <span className="font-semibold text-foreground">{fmt ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// Cut-offs come from @/lib/healthBands so every screen bands a score alike.
function ScoreBar({ score }: { score: number }) {
  const c = healthColor(score);
  const tc = healthTextClass(score);
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: c }} />
      </div>
      <span className={cn("text-xs font-semibold tabular-nums w-7", tc)}>{score}</span>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-slate-200 dark:border-slate-700 bg-card shadow-sm", className)}>{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-semibold text-foreground">{children}</p>;
}
function SectionSub({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-muted-foreground mt-0.5">{children}</p>;
}
function EmptyRow({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-8 text-center text-[12px] text-muted-foreground">{children}</div>;
}

/**
 * How much of a trend series can actually be plotted.
 *
 * The API returns one entry per month and leaves months with no recorded data
 * as null rather than inventing a number. A series can therefore be non-empty
 * and still have nothing to draw, so counting entries is not enough.
 *
 *   "empty"   no month carries a value
 *   "single"  exactly one month does. A line needs two points, so a chart
 *             drawn from this renders as a lone dot.
 *   "ok"      two or more months, enough for a trend
 */
type SeriesState = "empty" | "single" | "ok";

function seriesState<T>(rows: T[] | undefined, keys: (keyof T)[]): SeriesState {
  if (!rows?.length) return "empty";
  const withValue = rows.filter((r) =>
    keys.some((k) => {
      const v = r[k] as unknown;
      return typeof v === "number" && Number.isFinite(v);
    }),
  ).length;
  if (withValue === 0) return "empty";
  return withValue === 1 ? "single" : "ok";
}

/** Shown when a series holds one reading. States the value and why no line is
 *  drawn, instead of rendering a chart with a single unexplained point. */
function SingleReading({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-1.5 px-6 text-center">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-3xl font-bold tabular-nums text-foreground">{value}</span>
      <p className="max-w-[42ch] text-[12px] leading-relaxed text-muted-foreground">{note}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useNavRouter();
  const [data, setData] = React.useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [now, setNow] = React.useState<Date | null>(null);
  const [tab, setTab] = React.useState<"health" | "tickets" | "cost">("health");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminDashboard();
      setData(result);
      if (result) {
        window.localStorage.setItem("predictix.cached_dashboard_data", JSON.stringify(result));
      }
    } catch (e) {
      console.warn("Failed to load dashboard data:", e);
      setError(e instanceof Error ? e.message : "Failed to load dashboard data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // The header clock next to the "Live" badge is a wall clock, not a
  // "data last fetched" timestamp, so it ticks on its own interval rather than
  // updating only when the page loads. Tick it
  // independently of data fetching so it always reflects the current time.
  React.useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <PredictiXLoader label="Loading dashboard…" />
      </div>
    );
  }

  const time = now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  const date = now ? now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) : "";

  const k = data?.kpis;
  // Fleet Health and Predicted Failures render an empty state when no PdM
  // predictions exist yet. Showing "0%" there would be indistinguishable from
  // a genuine reading of zero, which is an alarming number to display falsely.
  const hasPredictions = k?.hasPredictionData ?? false;

  // Cost coverage. A missing count means an older backend, so treat it as
  // fully covered rather than warning about data the user cannot act on.
  const costedAssets = k?.estMaintenanceCostAssetCount ?? (k?.totalAssets ?? 0);
  const costIsPartial = !!k && costedAssets < k.totalAssets;
  const costSubLabel = !k
    ? "LKR · current estimate"
    : costedAssets === 0
      ? "No assets could be costed"
      : costIsPartial
        ? `LKR · ${costedAssets} of ${k.totalAssets} assets costed`
        : "LKR · current estimate";

  const kpiCards = [
    { label: "Total Assets", value: k ? String(k.totalAssets) : "—", sub: "Fleet-wide", icon: Package, iconBg: "bg-violet-100 dark:bg-violet-500/15", iconColor: "text-violet-600 dark:text-violet-400", accent: "text-violet-600 dark:text-violet-400" },
    { label: "Critical Alerts", value: k ? String(k.criticalAlerts) : "—", sub: "Require action now", icon: Flame, iconBg: "bg-rose-100 dark:bg-rose-500/15", iconColor: "text-rose-600 dark:text-rose-400", accent: "text-rose-600 dark:text-rose-400" },
    { label: "Open Tickets", value: k ? String(k.openTickets) : "—", sub: k ? `${k.highPriorityTickets} high priority` : "", icon: Ticket, iconBg: "bg-amber-100 dark:bg-amber-500/15", iconColor: "text-amber-600 dark:text-amber-400", accent: "text-amber-600 dark:text-amber-400" },
    { label: "Fleet Health", value: k ? (hasPredictions ? `${Math.round(k.fleetHealth)}%` : "—") : "—", sub: hasPredictions ? "Fleet-wide average" : "No predictions yet", icon: Activity, iconBg: "bg-emerald-100 dark:bg-emerald-500/15", iconColor: "text-emerald-600 dark:text-emerald-400", accent: "text-emerald-600 dark:text-emerald-400" },
    // Counts every asset currently on record with failure_probability >= 50%.
    // No time horizon is applied, so the sub-label states the threshold rather
    // than a window.
    { label: "Predicted Failures", value: k ? (hasPredictions ? String(k.predictedFailures) : "—") : "—", sub: hasPredictions ? "≥ 50% failure probability" : "No predictions yet", icon: Brain, iconBg: "bg-sky-100 dark:bg-sky-500/15", iconColor: "text-sky-600 dark:text-sky-400", accent: "text-sky-600 dark:text-sky-400" },
    // Sum of the current per-asset cost estimate across the fleet — not a
    // rolling 30-day figure (pdm_batch_predictions holds one current
    // estimate per asset, not a time-bounded window), so the label no
    // longer claims "30 days".
    // Unscored assets contribute nothing to the sum, so it can cover fewer
    // assets than the fleet. The sub-label says so when it does.
    { label: "Est. Maint. Cost", value: k ? (costedAssets > 0 ? fmtCompact(k.estMaintenanceCost) : "—") : "—", sub: costSubLabel, icon: Wrench, iconBg: "bg-slate-100 dark:bg-slate-500/15", iconColor: "text-slate-500 dark:text-slate-400", accent: "text-slate-600 dark:text-slate-400" },
  ];

  const healthTrend = data?.healthTrend ?? [];
  const ticketTrend = data?.ticketTrend ?? [];

  // A month with no recorded predictions comes back as null rather than an
  // invented number, so a six-entry array can still hold a single plottable
  // point. Length alone cannot tell those apart.
  const healthState = seriesState(healthTrend, ["avgHealth"]);
  const onlyHealthPoint = healthTrend.find(
    (p) => typeof p.avgHealth === "number" && Number.isFinite(p.avgHealth),
  );
  const dist = data?.healthDistribution ?? [];
  // The backend always returns the 5 fixed bands (Excellent..Critical) even
  // with zero predictions, each at count: 0 — so dist.length is never 0 for
  // a brand-new warehouse. distTotalRaw (before the `|| 1` div-by-zero
  // guard) is what actually distinguishes "no data" from "data, all zero".
  const distTotalRaw = dist.reduce((s, d) => s + d.count, 0);
  const distTotal = distTotalRaw || 1;
  const costTrend = data?.costTrend ?? [];
  const ticketState = seriesState(ticketTrend, ["opened", "inProgress", "resolved"]);
  const costState = seriesState(costTrend, ["planned", "unplanned"]);
  const downtime = data?.downtimeByWarehouse ?? [];
  const downtimeByMonth = data?.downtimeScope === "month";
  const risks = data?.topRiskAssets ?? [];
  const alerts = data?.recentAlerts ?? [];
  const tickets = data?.latestTickets ?? [];
  // Drop malformed entries before rendering. Reading .tone off a null would
  // throw during render and take down the whole dashboard, so one bad item is
  // skipped rather than allowed to fail the page.
  const insights = (data?.aiInsights ?? []).filter(
    (ins): ins is DashboardInsight => !!ins && typeof ins === "object"
  );
  const footer = data?.footerStats;

  return (
    <div className="relative space-y-5 pb-20">
      <div className="relative z-10 space-y-5">

        {/* ══ Hero header ════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 dark:border-white/10 dark:bg-white/2">
          <div className="absolute inset-0 bg-linear-to-br from-violet-50/90 via-white/70 to-sky-50/80 dark:from-violet-500/8 dark:via-white/2 dark:to-transparent pointer-events-none" />
          <div className="relative px-7 py-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-violet-500 dark:text-violet-400">PredictiX</span>
                <span className="text-muted-foreground/30 text-xs font-light">/</span>
                <span className="text-[10px] tracking-widest uppercase text-muted-foreground/60">Admin</span>
                <span className="text-muted-foreground/30 text-xs font-light">/</span>
                <span className="text-[10px] tracking-widest uppercase text-muted-foreground/80">Dashboard</span>
              </div>
              <h1 className="text-[26px] font-semibold tracking-[-0.025em] leading-none text-foreground">
                Operations Dashboard
              </h1>
              <div className="flex items-center gap-2.5 mt-2.5">
                <p className="text-[12px] text-muted-foreground leading-tight max-w-sm">
                  Real-time asset health, AI failure predictions and maintenance operations.
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-background/60 dark:bg-white/5 border border-border backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <Clock className="h-3 w-3" />
                  <span>{date} · <span className="font-semibold text-foreground">{time}</span></span>
                </div>
                <button
                  onClick={load}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/70 dark:bg-white/5 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-background transition-colors"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                  Refresh
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/25 px-2.5 py-1 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                  <Flame className="h-3 w-3" /> {k?.criticalAlerts ?? 0} critical alerts
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  <Ticket className="h-3 w-3" /> {k?.openTickets ?? 0} open tickets
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100/80 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/25 px-2.5 py-1 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                  <Brain className="h-3 w-3" /> {k?.predictedFailures ?? 0} predicted failures
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Backend-offline notice */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-[12px] text-amber-700 dark:text-amber-300">
            <Info className="h-4 w-4 shrink-0" />
            <span>Live dashboard data is unavailable ({error}). Showing empty state — start the backend or implement <code className="font-mono">/admin-dashboard/summary</code>.</span>
          </div>
        )}

        {/* ══ KPIs ══════════════════════════════════════════════════════════ */}
        {/* All page-level rows below share this same 12-col grid at xl so their
            card edges land on the same vertical lines instead of drifting
            past each other (6-col vs 4-col vs 5-col grids only coincide at
            their outermost edges). */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-12">
          {kpiCards.map((c) => (
            <Card key={c.label} className="p-4 hover:shadow-sm transition-shadow cursor-default xl:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", c.iconBg)}>
                  <c.icon className={cn("h-4 w-4", c.iconColor)} />
                </div>
              </div>
              <p className={cn("text-[22px] font-semibold tracking-tight leading-none", c.accent)}>{c.value}</p>
              <p className="mt-1.5 text-[12px] font-medium text-foreground">{c.label}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{c.sub}</p>
            </Card>
          ))}
        </div>

        {/* ══ AI Insights strip ═════════════════════════════════════════════ */}
        {insights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-violet-500" />
              <span className="text-[12px] font-semibold text-foreground">AI Insights</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
              {insights.map((ins, i) => {
                const s = INSIGHT_STYLE[ins.tone] ?? INSIGHT_STYLE.info;
                return (
                  <div key={`${ins.title}-${i}`} className={cn("rounded-xl border p-4 xl:col-span-4", s.bg)}>
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0"><s.icon className={cn("h-4 w-4", s.color)} /></div>
                      <div>
                        <p className="text-[12px] font-semibold text-foreground leading-tight">{ins.title}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{ins.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ Charts row ════════════════════════════════════════════════════ */}
        <div className="grid gap-3 xl:grid-cols-12">
          <Card className="xl:col-span-8 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <SectionTitle>Asset & Operations Trends</SectionTitle>
                <SectionSub>Historical view</SectionSub>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
                {(["health", "tickets", "cost"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11px] font-medium transition-all capitalize",
                      tab === t ? "bg-background text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
                    )}
                  >{t === "cost" ? "Maint. cost" : t === "health" ? "Health" : "Tickets"}</button>
                ))}
              </div>
            </div>

            {/* flex-1 + min-h-0: when the grid stretches this card to match the
                (taller) right column, the chart grows to actually use that space
                instead of leaving it as dead whitespace below the footer stats. */}
            <div className="px-5 pt-4 pb-2 flex-1 min-h-0">
              {tab === "health" && (
                <div style={{ height: "100%", minHeight: 210 }}>
                  {healthState === "empty" ? (
                    <EmptyRow>No health-trend data yet.</EmptyRow>
                  ) : healthState === "single" ? (
                    <SingleReading
                      label={`${onlyHealthPoint?.month ?? ""} average health`}
                      value={`${Math.round(onlyHealthPoint?.avgHealth ?? 0)}%`}
                      note="Only one month of prediction history has been recorded so far. A trend line appears once a second month of nightly predictions is stored."
                    />
                  ) : (
                    <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%" debounce={200}>
                      <AreaChart data={healthTrend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                        <defs>
                          <linearGradient id="hG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" opacity={0.5} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CTip fmt={(v) => `${v}%`} />} />
                        <Area type="monotone" dataKey="avgHealth" name="Health score" stroke="#6366f1" strokeWidth={2} fill="url(#hG)"
                          dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                          /* The ring separates the active dot from the surface behind it, so
                             it has to follow the theme: a fixed white ring vanishes on a
                             white card. var(--card) is that surface. */
                          activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "var(--card)" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
              {tab === "tickets" && (
                <div style={{ height: "100%", minHeight: 210 }}>
                  {ticketState === "empty" ? (
                    <EmptyRow>No ticket-trend data yet.</EmptyRow>
                  ) : ticketState === "single" ? (
                    <SingleReading
                      label="Tickets recorded"
                      value={String(
                        ticketTrend.reduce((s, p) => s + (p.opened ?? 0) + (p.inProgress ?? 0) + (p.resolved ?? 0), 0),
                      )}
                      note="Only one month has ticket activity so far. A trend appears once a second month has tickets."
                    />
                  ) : (
                    <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%" debounce={200}>
                      <BarChart data={ticketTrend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barGap={3}>
                        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" opacity={0.5} />
                        <XAxis dataKey="period" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CTip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="opened" name="Opened" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="inProgress" name="In progress" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
              {tab === "cost" && (
                <div style={{ height: "100%", minHeight: 210 }}>
                  {costState === "empty" ? (
                    <EmptyRow>No cost-trend data yet.</EmptyRow>
                  ) : costState === "single" ? (
                    <SingleReading
                      label="Maintenance cost recorded"
                      value={`LKR ${fmtCompact(
                        costTrend.reduce((s, p) => s + (p.planned ?? 0) + (p.unplanned ?? 0), 0),
                      )}`}
                      note="Only one month has recorded maintenance cost so far. A trend appears once a second month has spend."
                    />
                  ) : (
                    <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%" debounce={200}>
                      <BarChart data={costTrend} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" opacity={0.5} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCompact(v)} />
                        <Tooltip content={<CTip fmt={(v) => `LKR ${fmtCompact(v)}`} />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        {/* Planned vs unplanned spend, same classification as
                            the downtime chart below. Reactive spend is the
                            figure a maintenance operation is managed against. */}
                        <Bar dataKey="planned" name="Planned" fill="#6366f1" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="unplanned" name="Unplanned" fill="#ef4444" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700">
              {[
                { label: "Avg health score", val: footer ? `${Math.round(footer.avgHealthScore)}%` : "—", color: "text-amber-600 dark:text-amber-400" },
                { label: "Tickets resolved", val: footer ? String(footer.ticketsResolved) : "—", color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Avg resolution", val: footer ? `${footer.avgResolutionDays.toFixed(1)}d` : "—", color: "text-sky-600 dark:text-sky-400" },
              ].map((s) => (
                <div key={s.label} className="px-4 py-3">
                  <p className={cn("text-[17px] font-semibold", s.color)}>{s.val}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Right column */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <Card className="p-4 flex-1">
              <SectionTitle>Health Distribution</SectionTitle>
              <SectionSub>{distTotal > 1 ? `${distTotal} assets by condition band` : "By condition band"}</SectionSub>
              {dist.length === 0 || distTotalRaw === 0 ? <EmptyRow>No distribution data.</EmptyRow> : (
                <div className="flex items-center gap-4 mt-3">
                  <div style={{ height: 110, minHeight: 110, width: 110, flexShrink: 0 }}>
                    <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%" debounce={200}>
                      <PieChart>
                        <Pie data={dist} dataKey="count" innerRadius={34} outerRadius={52} paddingAngle={2} startAngle={90} endAngle={-270}>
                          {dist.map((_, i) => <Cell key={i} fill={DIST_COLORS[i % DIST_COLORS.length]} strokeWidth={0} />)}
                        </Pie>
                        <Tooltip content={<PieTip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {dist.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: DIST_COLORS[i % DIST_COLORS.length] }} />
                        <span className="text-[11px] text-muted-foreground flex-1">{d.name}</span>
                        <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(d.count / distTotal) * 100}%`, background: DIST_COLORS[i % DIST_COLORS.length] }} />
                        </div>
                        <span className="text-[11px] font-semibold tabular-nums w-6 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <SectionTitle>{downtimeByMonth ? "Downtime Trend" : "Downtime by Warehouse"}</SectionTitle>
              {/* The warehouse-grouped branch applies no date filter, so that
                  variant is an all-time total. The label reflects which is shown. */}
              <SectionSub>{downtimeByMonth ? "Planned vs unplanned hours — last 6 months" : "Planned vs unplanned hours — all time"}</SectionSub>
              {/* Height sized for 6 categories at ~35px/row so every YAxis tick has
                  room to render — Recharts silently drops category labels that
                  don't fit rather than shrinking them, which was dropping every
                  other month at the previous, tighter height. */}
              <div className="mt-3" style={{ height: 230, minHeight: 230 }}>
                {downtime.length === 0 ? <EmptyRow>No downtime data.</EmptyRow> : (
                  <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%" debounce={200}>
                    {/* The two series can differ by an order of magnitude, so on
                        a shared linear axis the smaller one rendered as an
                        invisible sliver (#98). minPointSize floors every
                        non-zero bar to a visible pixel size, and the value
                        labels make the exact hours readable regardless of how
                        short the bar itself is. (The old note here claimed
                        planned always dwarfs unplanned — that was an artefact
                        of planned being computed as a constant 0.) */}
                    <BarChart data={downtime} layout="vertical" margin={{ top: 0, right: 28, left: 36, bottom: 0 }} barGap={3}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="warehouse" interval={0} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={34} />
                      <Tooltip content={<CTip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="planned" name="Planned" fill="#6366f1" radius={[0, 3, 3, 0]} minPointSize={2}>
                        <LabelList dataKey="planned" position="right" style={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                      </Bar>
                      <Bar dataKey="unplanned" name="Unplanned" fill="#ef4444" radius={[0, 3, 3, 0]} minPointSize={2}>
                        <LabelList dataKey="unplanned" position="right" style={{ fontSize: 10, fill: "#ef4444", fontWeight: 600 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* ══ Risk + Alerts ═════════════════════════════════════════════════ */}
        <div className="grid gap-3 xl:grid-cols-12">
          <Card className="xl:col-span-6">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
              <div><SectionTitle>Top Risk Assets</SectionTitle><SectionSub>Ranked by AI predicted failure probability</SectionSub></div>
              <button
                onClick={() => router.push("/admin/assets")}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-medium"
              >View all<ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
            <div>
              {risks.length === 0 ? <EmptyRow>No at-risk assets.</EmptyRow> : risks.map((a, i) => (
                <div
                  key={a.id}
                  onClick={() => router.push(`/admin/assets?asset_id=${a.id}`)}
                  className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-700 last:border-0 transition-colors hover:bg-muted/20 cursor-pointer"
                >
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                    i === 0 ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" :
                      i === 1 ? "bg-rose-50 text-rose-400 dark:bg-rose-500/10 dark:text-rose-500" :
                        "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                  )}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-semibold truncate">{a.name}</p>
                      {i < 2 && <ShieldAlert className="h-3 w-3 text-rose-500 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {a.location}
                      {a.daysToMaintenance != null && (
                        a.daysToMaintenance < 0
                          ? ` · maintenance overdue ${Math.abs(a.daysToMaintenance)}d`
                          : ` · ${a.daysToMaintenance}d to maintenance`
                      )}
                      {` · ${Math.round(a.failureProbability * 100)}% fail prob.`}
                    </p>
                  </div>
                  <ScoreBar score={Math.round(a.healthScore)} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="xl:col-span-6">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
              <div><SectionTitle>Recent Alerts</SectionTitle><SectionSub>Asset monitoring — latest events</SectionSub></div>
              <button
                onClick={() => router.push("/admin/assets")}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-medium"
              >View all<ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
            <div>
              {alerts.length === 0 ? <EmptyRow>No recent alerts.</EmptyRow> : alerts.map((a) => (
                <div key={a.id} className={cn("flex items-start gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-700 last:border-0 transition-colors cursor-default", SEV_ROW[a.severity])}>
                  <span className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", SEV_DOT[a.severity])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wide", SEV_LABEL[a.severity])}>{a.severity}</span>
                      <span className="text-[10px] text-muted-foreground">{a.id}</span>
                      {a.createdAt && <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>}
                    </div>
                    <p className="text-[12px] font-semibold text-foreground">{a.asset}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{a.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{a.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ══ Tickets table ═════════════════════════════════════════════════ */}
        <Card>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
            <div><SectionTitle>Maintenance Tickets</SectionTitle><SectionSub>Latest open and in-progress work orders</SectionSub></div>
            <button
              onClick={() => router.push("/admin/tickets")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors"
            >
              <ArrowUpRight className="h-3.5 w-3.5" /> Manage
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-150">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] bg-muted/40 border-b border-slate-200 dark:border-slate-700">
                {["Ticket", "Asset", "Priority", "Status", "Assigned"].map((h) => (
                  <div key={h} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</div>
                ))}
              </div>
              {tickets.length === 0 ? <EmptyRow>No tickets found.</EmptyRow> : tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => router.push(`/admin/tickets?ticket_id=${t.ticketId}`)}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                >
                  <div className="px-4 py-3">
                    <p className="text-[12px] font-semibold">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.id}</p>
                  </div>
                  <div className="px-4 py-3 flex items-center"><span className="text-[11px] text-muted-foreground">{t.asset}</span></div>
                  <div className="px-4 py-3 flex items-center"><Chip label={t.priority} cls={PRI[t.priority]} /></div>
                  <div className="px-4 py-3 flex items-center">
                    <Chip label={t.status === "in_progress" ? "In progress" : t.status === "resolved" ? "Resolved" : t.status === "closed" ? "Closed" : "Open"} cls={STA[t.status]} />
                  </div>
                  <div className="px-4 py-3 flex items-center"><span className="text-[11px] text-muted-foreground">{t.assignedTo}</span></div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ══ Operational summary banner ════════════════════════════════════ */}
        {/* Deliberately not called "AI ..." — the backend deterministically
            builds this from real KPI data (see admin_dashboard.py), it never
            calls an LLM for it. aiSummaryIsGenerated is kept in the API
            contract as a forward-compat hook (a cheap daily-batch real-AI
            upgrade is a known possible follow-up), but it's permanently
            false today, so there's nothing to branch on here — showing a
            single honest badge instead of dead either/or UI. */}
        {data?.aiSummary && (
          <div className="rounded-xl border border-violet-200 dark:border-violet-500/20 bg-linear-to-br from-violet-50 to-indigo-50/60 dark:from-violet-500/10 dark:to-transparent dark:bg-white/2 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-200 dark:border-violet-500/30 bg-violet-100 dark:bg-violet-500/15">
                <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <p className="text-[13px] font-semibold">Operational Summary</p>
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset bg-slate-100 text-slate-600 ring-slate-200 dark:bg-white/6 dark:text-slate-400 dark:ring-white/10">
                    Data summary
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{data.aiSummary}</p>
              </div>
              <button
                onClick={() => router.push("/admin/warehouse")}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-violet-200 dark:border-violet-500/30 bg-white/70 dark:bg-violet-500/10 hover:bg-violet-50 dark:hover:bg-violet-500/20 px-3 py-1.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300 transition-colors"
              >
                Full report <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
