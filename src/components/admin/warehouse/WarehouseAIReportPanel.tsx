"use client";

import * as React from "react";
import {
  Brain,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Download,
  RefreshCw,
  BookOpen,
  Users,
  Activity,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  Ticket,
  Clock,
} from "lucide-react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
  LineChart, Line, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

/**
 * WarehouseAIReportPanel
 * -----------------------
 * Full-report panel rendered inline on the warehouse page.
 * 5 AI sections + comprehensive charts from live PostgreSQL data.
 * No format options — always Full Report.
 */

// ── Palette ─────────────────────────────────────────────
const P = {
  violet:  "#7c3aed",
  indigo:  "#4f46e5",
  emerald: "#059669",
  amber:   "#d97706",
  rose:    "#e11d48",
  sky:     "#0284c7",
  slate:   "#64748b",
  teal:    "#0d9488",
};
const PIE_COLORS = [P.violet, P.sky, P.emerald, P.amber, P.rose, P.teal, P.slate, P.indigo];

// ── Types ────────────────────────────────────────────────
interface AISections {
  insight_summary?: string;
  risk_analysis?: string;
  maintenance_intelligence?: string;
  pattern_and_trend?: string;
  conclusion?: string;
}

interface CriticalAsset {
  code: string; name: string; type: string; make: string; model: string;
  health_score: number; health: string; failure_prob: string;
  risk: string; days_to_service: number | null; status: string;
}

interface MonthlyMaintenance { month: string; cost: number; events: number; }
interface TicketTrend { month: string; tickets: number; }

interface Ctx {
  warehouse_name?: string; warehouse_city?: string; warehouse_code?: string;
  report_date?: string; period?: string; department_count?: number;
  total_assets?: number; active_assets?: number; inactive_assets?: number;
  under_maintenance_assets?: number; retired_assets?: number;
  avg_vehicle_age_years?: number;
  asset_type_breakdown?: Record<string, number>;
  asset_status_breakdown?: Record<string, number>;
  avg_health_pct?: number; healthy_count?: number; moderate_count?: number;
  at_risk_count?: number; critical_count?: number;
  avg_failure_prob_pct?: number;
  risk_breakdown?: Record<string, number>;
  health_score_distribution?: Record<string, number>;
  top_shap_features?: [string, number][];
  urgent_maintenance_count?: number; soon_maintenance_count?: number;
  avg_days_to_maintenance?: number | null;
  critical_assets?: CriticalAsset[];
  total_estimated_cost?: number; avg_cost_per_asset?: number;
  min_cost_estimate?: number; max_cost_estimate?: number; currency?: string;
  actual_cost_3m?: number;
  total_maintenance_events_3m?: number; avg_downtime_hours?: number;
  maintenance_type_breakdown?: Record<string, number>;
  monthly_maintenance_trend?: MonthlyMaintenance[];
  total_tickets?: number; open_tickets?: number; in_progress_tickets?: number;
  active_tickets?: number; resolved_tickets?: number; closed_tickets?: number;
  high_priority_active_tickets?: number;
  ticket_priority_breakdown?: Record<string, number>;
  ticket_category_breakdown?: Record<string, number>;
  ticket_trend_last_3m?: TicketTrend[];
  ticket_trend_direction?: string;
  total_users?: number; active_users?: number; inactive_users?: number;
  admin_users?: number; standard_users?: number;
}

export interface ReportData {
  ai_sections: AISections;
  context: Ctx;
}

interface Props {
  data: ReportData | null;
  loading: boolean;
  error: string | null;
  onRegenerate: () => void;
  onClose: () => void;
}

// ── Helper components ────────────────────────────────────

const SECTION_STYLE = "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden";

function SectionHeader({
  icon: Icon, title, subtitle, accent, collapsed, onToggle,
}: {
  icon: React.ElementType; title: string; subtitle: string;
  accent: string; collapsed: boolean; onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} className="w-full text-left">
      <div className="flex items-center gap-4 px-6 py-4" style={{ background: `linear-gradient(135deg, ${accent}14, ${accent}05)` }}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${accent}20`, color: accent }}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{title}</h3>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
        {collapsed
          ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronUp   className="h-4 w-4 text-muted-foreground shrink-0" />
        }
      </div>
    </button>
  );
}

function AIBlock({ text }: { text?: string }) {
  if (!text) return (
    <p className="text-sm text-muted-foreground italic">
      No content generated for this section.
    </p>
  );
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-4 py-3">
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{text}</p>
    </div>
  );
}

function KpiTile({ label, value, color, note }: { label: string; value: string | number; color?: string; note?: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-4 py-3 min-w-[95px]">
      <span className="text-xl font-bold" style={{ color: color || P.violet }}>{value}</span>
      <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">{label}</span>
      {note && <span className="text-[10px] text-muted-foreground/70 mt-0.5">{note}</span>}
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

function useToggle(init = false) {
  const [v, setV] = React.useState(init);
  return [v, () => setV((p) => !p)] as const;
}

// Custom tooltip for recharts
interface TooltipPayloadItem {
  color?: string;
  name?: React.ReactNode;
  value?: number | string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: React.ReactNode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-3 py-2 text-xs shadow-lg">
      {label && <div className="font-semibold mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────

export default function WarehouseAIReportPanel({
  data, loading, error, onRegenerate, onClose,
}: Props) {
  const [sourcesOpen, setSourcesOpen] = React.useState(false);
  const [s1Collapsed, toggleS1] = useToggle(false);
  const [s2Collapsed, toggleS2] = useToggle(false);
  const [s3Collapsed, toggleS3] = useToggle(false);
  const [s4Collapsed, toggleS4] = useToggle(false);
  const [s5Collapsed, toggleS5] = useToggle(false);

  const ctx = data?.context ?? {} as Ctx;
  const ai  = data?.ai_sections ?? {} as AISections;
  const cur = ctx.currency ?? "LKR";

  // Chart data
  const riskData         = toChartData(ctx.risk_breakdown);
  const healthDistData   = toChartData(ctx.health_score_distribution);
  const assetTypeData    = toChartData(ctx.asset_type_breakdown);
  const assetStatusData  = toChartData(ctx.asset_status_breakdown);
  const ticketPriData    = toChartData(ctx.ticket_priority_breakdown);
  const ticketCatData    = toChartData(ctx.ticket_category_breakdown).slice(0, 6);
  const maintenTypeData  = toChartData(ctx.maintenance_type_breakdown);
  const ticketTrend      = ctx.ticket_trend_last_3m ?? [];
  const maintenTrend     = ctx.monthly_maintenance_trend ?? [];
  const shapData = (ctx.top_shap_features ?? []).slice(0, 6).map(([feat, cnt]) => ({
    subject: feat.replace(/_/g, " ").slice(0, 20),
    count: cnt,
  }));

  return (
    <div className="mt-6 space-y-4">

      {/* ── Report Header Bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-violet-200 dark:border-violet-500/20 bg-linear-to-r from-violet-50 to-indigo-50 dark:from-violet-500/10 dark:to-transparent dark:bg-white/2 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight">AI Warehouse Full Report</h2>
              <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide">
                Llama 3 · RAG
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {ctx.warehouse_name ?? "PredictiX Warehouse"} · {ctx.warehouse_city} · {ctx.report_date}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSourcesOpen((p) => !p)}
            className="flex items-center gap-1.5 rounded-xl border border-violet-200 dark:border-violet-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" /> RAG Sources
          </button>
          <button
            onClick={() => window.print()}
            disabled={!data}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" /> PDF
          </button>
          <button
            onClick={onRegenerate}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors disabled:opacity-60"
          >
            {loading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <RefreshCw className="h-3.5 w-3.5" />
            }
            Regenerate
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" /> Close
          </button>
        </div>
      </div>

      {/* RAG Sources drawer */}
      {sourcesOpen && ctx.total_assets !== undefined && (
        <div className="rounded-2xl border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/20 px-5 py-4">
          <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
            📊 PostgreSQL Tables Injected into Llama 3 Context
          </h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-violet-700 dark:text-violet-300 sm:grid-cols-3">
            <span>🏭 <strong>assets</strong> — {ctx.total_assets} records</span>
            <span>📉 <strong>asset_failure_predictions</strong> — health, risk, SHAP</span>
            <span>💰 <strong>asset_cost_predictions</strong> — cost estimates</span>
            <span>🔧 <strong>maintenance_events</strong> — {ctx.total_maintenance_events_3m} (90d)</span>
            <span>🎫 <strong>tickets</strong> — {ctx.total_tickets} records</span>
            <span>👤 <strong>profiles</strong> — {ctx.total_users} users</span>
            <span>🧠 <strong>prediction_explanations</strong> — SHAP features</span>
            <span>🏢 <strong>warehouses</strong> + <strong>departments</strong></span>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex min-h-70 flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-950 blur-lg" />
          </div>
          <p className="mt-4 text-sm font-semibold">Generating AI Report…</p>
          <p className="mt-1 text-xs text-muted-foreground">
            PostgreSQL → RAG Context Injection → Llama 3 (Meta AI) → Structured Report
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 p-5">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">Report Generation Failed</p>
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{error}</p>
              {error.includes("GROQ_API_KEY") && (
                <div className="mt-3 rounded-xl bg-rose-100 dark:bg-rose-900/40 px-3 py-2.5 text-xs">
                  <strong>Fix:</strong> Add <code className="rounded bg-rose-200 dark:bg-rose-800 px-1">GROQ_API_KEY=gsk_xxx</code> to your <code>.env</code> file.{" "}
                  <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="underline font-medium">
                    Get free key →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* REPORT CONTENT                                       */}
      {/* ═══════════════════════════════════════════════════ */}

      {data && !loading && (
        <>
          {/* KPI Strip */}
          <div className="flex flex-wrap gap-2">
            <KpiTile label="Total Assets"     value={ctx.total_assets ?? "–"}                                color={P.violet}  />
            <KpiTile label="Fleet Health"     value={`${ctx.avg_health_pct ?? "–"}%`}                       color={P.emerald} />
            <KpiTile label="Failure Prob"     value={`${ctx.avg_failure_prob_pct ?? "–"}%`}                  color={P.rose}    />
            <KpiTile label="Critical Assets"  value={ctx.critical_count ?? "–"}                              color={P.rose}    />
            <KpiTile label="Urgent ≤7d"       value={ctx.urgent_maintenance_count ?? "–"}                    color={P.amber}   />
            <KpiTile label="Active Tickets"   value={ctx.active_tickets ?? "–"}                              color={P.sky}     />
            <KpiTile label="Active Users"     value={ctx.active_users ?? "–"}                                color={P.indigo}  />
            <KpiTile label="Est. Cost"        value={`${cur} ${fmtM(ctx.total_estimated_cost ?? 0)}M`}       color={P.teal}    />
          </div>

          {/* ─────────────────────────────── */}
          {/* SECTION 1 — Executive Summary   */}
          {/* ─────────────────────────────── */}
          <div className={SECTION_STYLE}>
            <SectionHeader
              icon={Brain} accent={P.violet} collapsed={s1Collapsed} onToggle={toggleS1}
              title="1. Executive Insight Summary"
              subtitle="Overall warehouse condition · Fleet health · Costs · Tickets · Workforce"
            />
            {!s1Collapsed && (
              <div className="px-6 py-5 space-y-5">
                <AIBlock text={ai.insight_summary} />

                <SectionDivider label="Asset Overview" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Asset Status pie */}
                  {assetStatusData.length > 0 && (
                    <div>
                      <h4 className="chart-label">Asset Status Distribution</h4>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={assetStatusData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                            {assetStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconType="circle" iconSize={7} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Asset Types bar */}
                  {assetTypeData.length > 0 && (
                    <div>
                      <h4 className="chart-label">Assets by Type</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={assetTypeData} layout="vertical" margin={{ left: 130, right: 20, top: 10, bottom: 10 }}>
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" fill={P.violet} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* User stats */}
                  <div>
                    <h4 className="chart-label">Users & Workforce</h4>
                    <div className="space-y-2 mt-2">
                      {[
                        { label: "Total Users",    val: ctx.total_users,    color: P.violet,  icon: Users },
                        { label: "Active",         val: ctx.active_users,   color: P.emerald, icon: CheckCircle },
                        { label: "Inactive",       val: ctx.inactive_users, color: P.slate,   icon: XCircle },
                        { label: "Admin Users",    val: ctx.admin_users,    color: P.indigo,  icon: ShieldAlert },
                        { label: "Standard Users", val: ctx.standard_users, color: P.sky,     icon: Users },
                      ].map(({ label, val, color, icon: Icon }) => (
                        <div key={label} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" style={{ color }} />
                            <span className="text-muted-foreground">{label}</span>
                          </div>
                          <span className="font-semibold" style={{ color }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <SectionDivider label="Ticket Overview" />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: "Open",        val: ctx.open_tickets,       color: P.amber },
                    { label: "In Progress", val: ctx.in_progress_tickets, color: P.sky },
                    { label: "Resolved",    val: ctx.resolved_tickets,    color: P.emerald },
                    { label: "Closed",      val: ctx.closed_tickets,      color: P.slate },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-3 py-2.5 items-center">
                      <span className="text-lg font-bold" style={{ color: s.color }}>{s.val}</span>
                      <span className="text-[11px] text-muted-foreground">{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="text-amber-700 dark:text-amber-300">
                    <strong>{ctx.high_priority_active_tickets}</strong> high-priority tickets are currently active (open or in progress)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ─────────────────────────────── */}
          {/* SECTION 2 — Risk Analysis       */}
          {/* ─────────────────────────────── */}
          <div className={SECTION_STYLE}>
            <SectionHeader
              icon={AlertTriangle} accent={P.rose} collapsed={s2Collapsed} onToggle={toggleS2}
              title="2. Risk & Failure Analysis"
              subtitle="AI-identified risk factors · SHAP failure drivers · Critical assets"
            />
            {!s2Collapsed && (
              <div className="px-6 py-5 space-y-5">
                <AIBlock text={ai.risk_analysis} />

                <SectionDivider label="Health & Risk Distribution" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Risk pie */}
                  {riskData.length > 0 && (
                    <div>
                      <h4 className="chart-label">Risk Level Distribution</h4>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={riskData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                            {riskData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconType="circle" iconSize={7} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Health score dist */}
                  {healthDistData.length > 0 && (
                    <div>
                      <h4 className="chart-label">Health Score Buckets</h4>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={healthDistData} margin={{ left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" fill={P.emerald} radius={[4, 4, 0, 0]}>
                            {healthDistData.map((_, i) => {
                              const colors = [P.emerald, P.sky, P.amber, P.amber, P.rose];
                              return <Cell key={i} fill={colors[i] || P.slate} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* SHAP features */}
                  {shapData.length > 0 && (
                    <div>
                      <h4 className="chart-label">Top AI Failure Drivers (SHAP)</h4>
                      <ResponsiveContainer width="100%" height={160}>
                        <RadarChart data={shapData} cx="50%" cy="50%" outerRadius={55}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                          <Radar dataKey="count" stroke={P.violet} fill={P.violet} fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <SectionDivider label="Critical Assets (Lowest Health Scores)" />
                {(ctx.critical_assets?.length ?? 0) > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          {["Asset Code", "Name / Type", "Health", "Fail Prob", "Risk Level", "Days to Service", "Status"].map((h) => (
                            <th key={h} className="pb-2 pr-4 text-left font-semibold text-[11px] text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ctx.critical_assets!.map((a) => (
                          <tr key={a.code} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="py-2 pr-4 font-mono font-semibold text-rose-600">{a.code}</td>
                            <td className="py-2 pr-4">
                              <div className="font-medium">{a.name}</div>
                              <div className="text-muted-foreground">{a.type}</div>
                            </td>
                            <td className="py-2 pr-4">
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${a.health_score}%`,
                                      backgroundColor: a.health_score < 50 ? P.rose : a.health_score < 70 ? P.amber : P.emerald,
                                    }}
                                  />
                                </div>
                                <span className="font-semibold">{a.health}</span>
                              </div>
                            </td>
                            <td className="py-2 pr-4 font-medium" style={{ color: P.rose }}>{a.failure_prob}</td>
                            <td className="py-2 pr-4">
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${P.rose}20`, color: P.rose }}>
                                {a.risk}
                              </span>
                            </td>
                            <td className="py-2 pr-4 font-medium">
                              {a.days_to_service !== null
                                ? <span style={{ color: a.days_to_service! <= 7 ? P.rose : a.days_to_service! <= 30 ? P.amber : P.slate }}>
                                    {a.days_to_service}d
                                  </span>
                                : "N/A"
                              }
                            </td>
                            <td className="py-2">
                              <span className="capitalize text-muted-foreground">{a.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center py-4">No critical assets found.</p>
                )}
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────── */}
          {/* SECTION 3 — Maintenance Intelligence   */}
          {/* ─────────────────────────────────────── */}
          <div className={SECTION_STYLE}>
            <SectionHeader
              icon={Wrench} accent={P.amber} collapsed={s3Collapsed} onToggle={toggleS3}
              title="3. Maintenance Intelligence & Cost Forecast"
              subtitle="Service requirements · Downtime analysis · Cost predictions"
            />
            {!s3Collapsed && (
              <div className="px-6 py-5 space-y-5">
                <AIBlock text={ai.maintenance_intelligence} />

                <SectionDivider label="Service Urgency" />
                <div className="flex flex-wrap gap-2">
                  <KpiTile label="Urgent ≤7 days"    value={ctx.urgent_maintenance_count ?? "–"} color={P.rose}    />
                  <KpiTile label="Soon ≤30 days"     value={ctx.soon_maintenance_count ?? "–"}   color={P.amber}   />
                  <KpiTile label="Avg Days to Svc"   value={ctx.avg_days_to_maintenance ?? "N/A"} color={P.sky}    />
                  <KpiTile label="Avg Downtime/Event" value={`${ctx.avg_downtime_hours ?? "–"}h`} color={P.slate}  />
                  <KpiTile label="Events (3 Months)"  value={ctx.total_maintenance_events_3m ?? "–"} color={P.teal} />
                </div>

                <SectionDivider label="Cost Analysis" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Cost KPIs */}
                  <div className="space-y-2">
                    {[
                      { label: "Total Predicted Cost",     val: `${cur} ${(ctx.total_estimated_cost ?? 0).toLocaleString()}`,  color: P.violet },
                      { label: "Avg Cost per Asset",       val: `${cur} ${(ctx.avg_cost_per_asset ?? 0).toLocaleString()}`,    color: P.indigo },
                      { label: "Actual Spend (3 Months)",  val: `${cur} ${(ctx.actual_cost_3m ?? 0).toLocaleString()}`,       color: P.emerald },
                      { label: "Cost Range",               val: `${cur} ${(ctx.min_cost_estimate ?? 0).toLocaleString()} – ${(ctx.max_cost_estimate ?? 0).toLocaleString()}`, color: P.slate },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-3 py-2 text-xs">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="font-semibold" style={{ color: item.color }}>{item.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Monthly maintenance trend */}
                  {maintenTrend.length > 0 && (
                    <div>
                      <h4 className="chart-label">Monthly Maintenance (Events & Cost)</h4>
                      <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={maintenTrend} margin={{ left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="events" name="Events" fill={P.amber} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Maintenance type breakdown */}
                {maintenTypeData.length > 0 && (
                  <>
                    <SectionDivider label="Event Type Breakdown" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={maintenTypeData} cx="50%" cy="50%" outerRadius={55} dataKey="value">
                            {maintenTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconType="circle" iconSize={7} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1.5">
                        {maintenTypeData.map((d, i) => (
                          <div key={d.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-muted-foreground">{d.name}</span>
                            </div>
                            <span className="font-semibold">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────── */}
          {/* SECTION 4 — Pattern & Trend Analysis   */}
          {/* ─────────────────────────────────────── */}
          <div className={SECTION_STYLE}>
            <SectionHeader
              icon={TrendingUp} accent={P.sky} collapsed={s4Collapsed} onToggle={toggleS4}
              title="4. Pattern & Trend Analysis"
              subtitle="3-month ticket & maintenance trends · Priority & category breakdown"
            />
            {!s4Collapsed && (
              <div className="px-6 py-5 space-y-5">
                <AIBlock text={ai.pattern_and_trend} />

                <SectionDivider label="Ticket Trends (Last 3 Months)" />

                {/* Trend direction badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/20 px-3 py-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
                  <span className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                    Ticket volume is <strong>{ctx.ticket_trend_direction ?? "stable"}</strong> over the last 3 months
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Ticket volume line chart */}
                  {ticketTrend.length > 0 && (
                    <div className="lg:col-span-2">
                      <h4 className="chart-label">Monthly Ticket Volume</h4>
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={ticketTrend} margin={{ left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="tickets" name="Tickets" stroke={P.sky} strokeWidth={2.5} dot={{ r: 4, fill: P.sky }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Ticket priority pie */}
                  {ticketPriData.length > 0 && (
                    <div>
                      <h4 className="chart-label">Ticket Priority</h4>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={ticketPriData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value">
                            {ticketPriData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend iconType="circle" iconSize={7} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Ticket categories */}
                {ticketCatData.length > 0 && (
                  <>
                    <SectionDivider label="Ticket Category Breakdown" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={ticketCatData} layout="vertical" margin={{ left: 4 }}>
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={90} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" fill={P.sky} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="space-y-1.5">
                        {ticketCatData.map((d, i) => (
                          <div key={d.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-muted-foreground truncate max-w-35">{d.name}</span>
                            </div>
                            <span className="font-semibold">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────── */}
          {/* SECTION 5 — 3-Month Conclusion (RAG)   */}
          {/* ─────────────────────────────────────── */}
          <div className={`${SECTION_STYLE} border-violet-200 dark:border-violet-800`}>
            <SectionHeader
              icon={FileText} accent={P.indigo} collapsed={s5Collapsed} onToggle={toggleS5}
              title="5. Overall Warehouse Conclusion (Last 3 Months)"
              subtitle="AI-generated executive summary with top recommendations — powered by full RAG context"
            />
            {!s5Collapsed && (
              <div className="px-6 py-5 space-y-5">
                <AIBlock text={ai.conclusion} />

                <SectionDivider label="3-Month Summary Dashboard" />

                {/* Comprehensive summary grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Fleet card */}
                  <div className="rounded-2xl border border-violet-100 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-violet-600" />
                      <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">Fleet Health</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <Row label="Total Assets"    val={ctx.total_assets}     />
                      <Row label="Active"          val={ctx.active_assets}    color={P.emerald} />
                      <Row label="Inactive"        val={ctx.inactive_assets}  color={P.slate} />
                      <Row label="Avg Health"      val={`${ctx.avg_health_pct}%`} color={ctx.avg_health_pct! > 70 ? P.emerald : P.rose} />
                      <Row label="Critical"        val={ctx.critical_count}   color={P.rose} />
                    </div>
                  </div>

                  {/* Tickets card */}
                  <div className="rounded-2xl border border-sky-100 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Ticket className="h-4 w-4 text-sky-600" />
                      <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">Ticket Status</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <Row label="Total Tickets"   val={ctx.total_tickets}       />
                      <Row label="Active"          val={ctx.active_tickets}      color={P.amber} />
                      <Row label="Open"            val={ctx.open_tickets}        color={P.amber} />
                      <Row label="In Progress"     val={ctx.in_progress_tickets} color={P.sky} />
                      <Row label="High Priority"   val={ctx.high_priority_active_tickets} color={P.rose} />
                    </div>
                  </div>

                  {/* Cost card */}
                  <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Financials</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <Row label="Est. Maintenance"  val={`${cur} ${fmtM(ctx.total_estimated_cost ?? 0)}M`}  color={P.violet} />
                      <Row label="Actual 3M Spend"   val={`${cur} ${fmtM(ctx.actual_cost_3m ?? 0)}M`}       color={P.emerald} />
                      <Row label="Avg per Asset"     val={`${cur} ${(ctx.avg_cost_per_asset ?? 0).toLocaleString()}`} color={P.slate} />
                      <Row label="Maintenance Events" val={ctx.total_maintenance_events_3m}  />
                      <Row label="Avg Downtime"      val={`${ctx.avg_downtime_hours}h / event`} />
                    </div>
                  </div>
                </div>

                {/* Maintenance urgency indicator */}
                <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-rose-600 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-rose-700 dark:text-rose-400">Maintenance Urgency</div>
                    <p className="text-xs text-rose-600 dark:text-rose-300 mt-0.5">
                      <strong>{ctx.urgent_maintenance_count}</strong> assets require service within 7 days.{" "}
                      <strong>{ctx.soon_maintenance_count}</strong> assets need attention within 30 days.
                      Average time to next required service: <strong>{ctx.avg_days_to_maintenance ?? "N/A"} days</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Print styles */}
      <style>{`
        .chart-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 8px; }
        @media print { button, nav, header { display: none !important; } }
      `}</style>
    </div>
  );
}

// ── Utilities ─────────────────────────────────────────────

function toChartData(obj?: Record<string, number>): { name: string; value: number }[] {
  if (!obj) return [];
  return Object.entries(obj).map(([name, value]) => ({ name, value }));
}

function fmtM(n: number): string {
  return ((n) / 1_000_000).toFixed(1);
}

function Row({ label, val, color }: { label: string; val?: string | number; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold" style={color ? { color } : {}}>{val ?? "–"}</span>
    </div>
  );
}
