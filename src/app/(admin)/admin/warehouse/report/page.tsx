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
  Ticket,
  Package,
  ShieldAlert,
  Activity,
  DollarSign,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

const API_BASE = "http://127.0.0.1:8000/warehouse-dashboard";

// ── Color palette ─────────────────────────────────────────
const PALETTE = {
  violet: "#7c3aed",
  indigo: "#4f46e5",
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
  sky: "#0284c7",
  slate: "#64748b",
};
const STATUS_COLORS = ["#7c3aed", "#0284c7", "#059669", "#d97706", "#e11d48", "#64748b"];

// ── Types ─────────────────────────────────────────────────
interface AISections {
  insight_summary?: string;
  risk_analysis?: string;
  maintenance_intelligence?: string;
  pattern_and_trend?: string;
}

interface ReportContext {
  warehouse_name?: string;
  warehouse_city?: string;
  report_date?: string;
  total_assets?: number;
  active_assets?: number;
  inactive_assets?: number;
  avg_health_pct?: number;
  healthy_count?: number;
  at_risk_count?: number;
  critical_count?: number;
  urgent_maintenance_count?: number;
  avg_days_to_maintenance?: number;
  total_estimated_cost_lkr?: number;
  total_actual_maintenance_cost_3m_lkr?: number;
  total_tickets?: number;
  open_tickets?: number;
  in_progress_tickets?: number;
  resolved_tickets?: number;
  closed_tickets?: number;
  total_users?: number;
  active_users?: number;
  inactive_users?: number;
  admin_users?: number;
  standard_users?: number;
  risk_breakdown?: Record<string, number>;
  ticket_priority_breakdown?: Record<string, number>;
  ticket_category_breakdown?: Record<string, number>;
  ticket_trend_last_3m?: { month: string; tickets: number }[];
  asset_type_breakdown?: Record<string, number>;
  critical_assets?: {
    code: string;
    name: string;
    type: string;
    health: string;
    risk: string;
    days_to_service: number | null;
  }[];
}

// ── Sub-components ────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      <div
        className="px-6 py-4 flex items-start gap-4"
        style={{ background: `linear-gradient(135deg, ${color}18, ${color}08)` }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${color}20`, color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
      <span
        className="text-xl font-bold"
        style={{ color: color || PALETTE.violet }}
      >
        {value}
      </span>
      <span className="mt-0.5 text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function AITextBlock({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      {text}
    </p>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function WarehouseReportPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [aiSections, setAiSections] = React.useState<AISections | null>(null);
  const [ctx, setCtx] = React.useState<ReportContext | null>(null);
  const [sourcesOpen, setSourcesOpen] = React.useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);

  const generateReport = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/generate-report`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setAiSections(data.ai_sections);
      setCtx(data.context);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownloadPDF = () => {
    window.print();
  };

  // Summary metrics from context
  const riskData = ctx?.risk_breakdown
    ? Object.entries(ctx.risk_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  const ticketPriorityData = ctx?.ticket_priority_breakdown
    ? Object.entries(ctx.ticket_priority_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  const ticketTrendData = ctx?.ticket_trend_last_3m || [];

  const assetTypeData = ctx?.asset_type_breakdown
    ? Object.entries(ctx.asset_type_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    AI Warehouse Report
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {ctx?.warehouse_name || "PredictiX Warehouse"} ·{" "}
                    {ctx?.report_date || "Generate report to view date"} ·{" "}
                    Powered by Llama 3 + PostgreSQL
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSourcesOpen((p) => !p)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <BookOpen className="h-4 w-4" />
                {sourcesOpen ? "Hide" : "View"} RAG Sources
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={!ctx}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                id="btn-generate-report"
                onClick={generateReport}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {loading ? "Generating…" : "Generate Report"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── RAG Sources Panel ── */}
      {sourcesOpen && ctx && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
            <h3 className="mb-3 text-sm font-semibold text-violet-700 dark:text-violet-300">
              📊 RAG Data Sources — Live PostgreSQL Context Injected into LLM
            </h3>
            <div className="grid gap-2 text-xs text-violet-800 dark:text-violet-300 sm:grid-cols-2 lg:grid-cols-3">
              <div>🏭 <strong>assets</strong> — {ctx.total_assets} total records</div>
              <div>💉 <strong>asset_failure_predictions</strong> — health & risk scores</div>
              <div>💰 <strong>asset_cost_predictions</strong> — cost estimates</div>
              <div>🔧 <strong>maintenance_events</strong> — last 3 months events</div>
              <div>🎫 <strong>tickets</strong> — {ctx.total_tickets} total tickets</div>
              <div>👤 <strong>profiles</strong> — {ctx.total_users} users</div>
            </div>
          </div>
        </div>
      )}

      <div ref={reportRef} className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* ── State: Empty ── */}
        {!loading && !aiSections && !error && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950">
              <Brain className="h-8 w-8 text-violet-600" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Generate Your AI Warehouse Report</h2>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Click <strong>Generate Report</strong> above to analyze your live PostgreSQL database using
              Llama 3 (Meta AI) and receive a comprehensive warehouse intelligence report.
            </p>
            <button
              onClick={generateReport}
              className="mt-6 flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              <Brain className="h-4 w-4" />
              Generate AI Report
            </button>
          </div>
        )}

        {/* ── State: Loading ── */}
        {loading && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
            <p className="mt-4 font-semibold">Analyzing warehouse data…</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Querying PostgreSQL → Injecting context → Llama 3 generating report
            </p>
          </div>
        )}

        {/* ── State: Error ── */}
        {error && !loading && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/30">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-semibold text-rose-700 dark:text-rose-400">
                  Report Generation Failed
                </p>
                <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{error}</p>
                {error.includes("GROQ_API_KEY") && (
                  <div className="mt-3 rounded-lg bg-rose-100 p-3 text-xs dark:bg-rose-900/40">
                    <strong>Fix:</strong> Add your Groq API key to{" "}
                    <code className="rounded bg-rose-200 px-1 dark:bg-rose-800">
                      PredictiX_backend/.env
                    </code>
                    :<br />
                    <code className="mt-1 block font-mono">
                      GROQ_API_KEY=gsk_xxxxxxxxxxxx
                    </code>
                    <p className="mt-1">
                      Get a free key at{" "}
                      <a
                        href="https://console.groq.com"
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        console.groq.com
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Report Content ── */}
        {aiSections && ctx && !loading && (
          <>
            {/* Overall KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatChip label="Total Assets" value={ctx.total_assets ?? "–"} color={PALETTE.violet} />
              <StatChip label="Fleet Health" value={`${ctx.avg_health_pct ?? "–"}%`} color={PALETTE.emerald} />
              <StatChip label="Critical Assets" value={ctx.critical_count ?? "–"} color={PALETTE.rose} />
              <StatChip label="Urgent Service" value={ctx.urgent_maintenance_count ?? "–"} color={PALETTE.amber} />
              <StatChip label="Open Tickets" value={ctx.open_tickets ?? "–"} color={PALETTE.sky} />
              <StatChip label="Active Users" value={ctx.active_users ?? "–"} color={PALETTE.indigo} />
            </div>

            {/* Section 1 — AI Overall Warehouse Summary */}
            <SectionCard
              icon={Brain}
              title="AI Warehouse Insight Summary"
              subtitle="Overall executive summary generated by Llama 3 (Meta AI) from live PostgreSQL data"
              color={PALETTE.violet}
            >
              <AITextBlock text={aiSections.insight_summary} />

              {/* Sub-stats: Assets + Users */}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Asset Status
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-muted-foreground">Active:</span>
                      <span className="font-semibold">{ctx.active_assets}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-rose-500" />
                      <span className="text-muted-foreground">Inactive:</span>
                      <span className="font-semibold">{ctx.inactive_assets}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-500" />
                      <span className="text-muted-foreground">Healthy:</span>
                      <span className="font-semibold">{ctx.healthy_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      <span className="text-muted-foreground">At Risk:</span>
                      <span className="font-semibold">{ctx.at_risk_count}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Users
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-violet-500" />
                      <span className="text-muted-foreground">Active:</span>
                      <span className="font-semibold">{ctx.active_users}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-muted-foreground">Inactive:</span>
                      <span className="font-semibold">{ctx.inactive_users}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-indigo-500" />
                      <span className="text-muted-foreground">Admin:</span>
                      <span className="font-semibold">{ctx.admin_users}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-500" />
                      <span className="text-muted-foreground">Standard:</span>
                      <span className="font-semibold">{ctx.standard_users}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket stats */}
              <div className="mt-4">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ticket Overview
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Open", value: ctx.open_tickets, color: PALETTE.amber },
                    { label: "In Progress", value: ctx.in_progress_tickets, color: PALETTE.sky },
                    { label: "Resolved", value: ctx.resolved_tickets, color: PALETTE.emerald },
                    { label: "Closed", value: ctx.closed_tickets, color: PALETTE.slate },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800/50"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-muted-foreground">{s.label}:</span>
                      <span className="font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* Section 2 — AI Risk Analysis */}
            <SectionCard
              icon={AlertTriangle}
              title="AI-Driven Risk Analysis"
              subtitle="Risk factors, high-risk asset categories, and SHAP-based fault drivers"
              color={PALETTE.rose}
            >
              <AITextBlock text={aiSections.risk_analysis} />

              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                {/* Risk Distribution Pie */}
                {riskData.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Risk Level Distribution
                    </h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={riskData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {riskData.map((_, i) => (
                            <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" iconSize={8} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Critical Assets Table */}
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    High-Risk Assets
                  </h4>
                  {ctx.critical_assets && ctx.critical_assets.length > 0 ? (
                    <div className="space-y-2">
                      {ctx.critical_assets.map((asset) => (
                        <div
                          key={asset.code}
                          className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800/50"
                        >
                          <div>
                            <span className="font-mono font-semibold text-rose-600">
                              {asset.code}
                            </span>
                            <span className="ml-2 text-muted-foreground">
                              {asset.name} · {asset.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{asset.health}</span>
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                backgroundColor: `${PALETTE.rose}20`,
                                color: PALETTE.rose,
                              }}
                            >
                              {asset.risk}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No critical assets found.</p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Section 3 — Maintenance Intelligence */}
            <SectionCard
              icon={Wrench}
              title="Maintenance Insights & Forecast"
              subtitle="Upcoming service requirements, cost forecasting, and downtime analysis"
              color={PALETTE.amber}
            >
              <AITextBlock text={aiSections.maintenance_intelligence} />

              {/* Cost + maintenance KPIs */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatChip
                  label="Urgent (≤7 days)"
                  value={ctx.urgent_maintenance_count ?? "–"}
                  color={PALETTE.rose}
                />
                <StatChip
                  label="Avg Days to Service"
                  value={ctx.avg_days_to_maintenance ?? "N/A"}
                  color={PALETTE.amber}
                />
                <StatChip
                  label="Est. Cost (LKR)"
                  value={`${((ctx.total_estimated_cost_lkr ?? 0) / 1_000_000).toFixed(1)}M`}
                  color={PALETTE.violet}
                />
                <StatChip
                  label="Actual Cost 3M (LKR)"
                  value={`${((ctx.total_actual_maintenance_cost_3m_lkr ?? 0) / 1_000_000).toFixed(1)}M`}
                  color={PALETTE.emerald}
                />
              </div>
            </SectionCard>

            {/* Section 4 — Pattern & Trend Detection */}
            <SectionCard
              icon={TrendingUp}
              title="Pattern & Trend Insights"
              subtitle="Operational trends in maintenance, tickets, and fleet health over last 3 months"
              color={PALETTE.sky}
            >
              <AITextBlock text={aiSections.pattern_and_trend} />

              <div className="mt-5 grid gap-6 lg:grid-cols-3">
                {/* Ticket trend line chart */}
                {ticketTrendData.length > 0 && (
                  <div className="lg:col-span-2">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Monthly Ticket Volume (Last 3 Months)
                    </h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={ticketTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="tickets"
                          stroke={PALETTE.sky}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: PALETTE.sky }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Asset type bar chart */}
                {assetTypeData.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Assets by Type
                    </h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={assetTypeData} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                        <Tooltip />
                        <Bar dataKey="value" fill={PALETTE.sky} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Ticket priority + category */}
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                {ticketPriorityData.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ticket Priority Breakdown
                    </h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={ticketPriorityData}
                          cx="50%"
                          cy="50%"
                          outerRadius={55}
                          dataKey="value"
                        >
                          {ticketPriorityData.map((_, i) => (
                            <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" iconSize={8} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {ctx.ticket_category_breakdown && Object.keys(ctx.ticket_category_breakdown).length > 0 && (
                  <div>
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ticket Categories
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(ctx.ticket_category_breakdown)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([cat, count], i) => (
                          <div key={cat} className="flex items-center gap-2 text-xs">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }}
                            />
                            <span className="flex-1 truncate text-muted-foreground">{cat}</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Conclusion */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 dark:border-slate-800 dark:from-violet-950/20 dark:to-indigo-950/20">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-5 w-5 text-violet-600" />
                <h2 className="font-semibold">Overall Warehouse Conclusion (Last 3 Months)</h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                The <strong>{ctx.warehouse_name}</strong> warehouse fleet comprises{" "}
                <strong>{ctx.total_assets}</strong> assets with an average health score of{" "}
                <strong>{ctx.avg_health_pct}%</strong>.{" "}
                <strong>{ctx.critical_count}</strong> assets are in critical condition, and{" "}
                <strong>{ctx.urgent_maintenance_count}</strong> require service within 7 days.
                The total predicted maintenance investment is{" "}
                <strong>LKR {(ctx.total_estimated_cost_lkr ?? 0).toLocaleString()}</strong>, while
                actual costs over the last 3 months amounted to{" "}
                <strong>LKR {(ctx.total_actual_maintenance_cost_3m_lkr ?? 0).toLocaleString()}</strong>.
                Across <strong>{ctx.total_tickets}</strong> tickets,{" "}
                <strong>{ctx.open_tickets}</strong> remain open and{" "}
                <strong>{ctx.in_progress_tickets}</strong> are in progress.
                The workforce includes <strong>{ctx.total_users}</strong> registered users —{" "}
                <strong>{ctx.active_users}</strong> active and{" "}
                <strong>{ctx.admin_users}</strong> with administrative privileges.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          button { display: none !important; }
          nav { display: none !important; }
          header { display: none !important; }
        }
      `}</style>
    </div>
  );
}
