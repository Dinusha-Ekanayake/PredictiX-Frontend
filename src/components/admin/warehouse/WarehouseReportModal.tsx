"use client";

import * as React from "react";
import {
  Brain, AlertTriangle, Wrench, TrendingUp, Download,
  RefreshCw, BookOpen, Users, Activity, ShieldAlert,
  CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp,
  FileText, DollarSign, Clock, ClipboardList, Database, Cpu, X, HeartPulse,
} from "lucide-react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { downloadProfessionalPDF } from "@/lib/professionalPdfExport";
import WarehouseSurvivalAnalysis from "./WarehouseSurvivalAnalysis";
import type { SurvivalSummary } from "@/lib/warehouseService";


// ── Palette ──────────────────────────────────────────────
const P = {
  violet: "#7c3aed", indigo: "#4f46e5", emerald: "#059669",
  amber: "#d97706", rose: "#e11d48", sky: "#0284c7",
  slate: "#64748b", teal: "#0d9488",
};
const PIE_COLORS = [P.violet, P.sky, P.emerald, P.amber, P.rose, P.teal, P.slate, P.indigo];

// ── Types ─────────────────────────────────────────────────
interface AISections {
  insight_summary?: string; risk_analysis?: string;
  maintenance_intelligence?: string; pattern_and_trend?: string;
  conclusion?: string;
}
interface CriticalAsset {
  code: string; name: string; type: string;
  health_score: number; health: string; failure_prob: string;
  risk: string; days_to_service: number | null; status: string;
  primary_driver?: string | null;
}
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
  urgent_count?: number;
  open_ticket_count?: number;
  monthly_maintenance_cost?: number;
  top_shap_features?: [string, number][];
  urgent_maintenance_count?: number; soon_maintenance_count?: number;
  avg_days_to_maintenance?: number | null;
  critical_assets?: CriticalAsset[];
  total_estimated_cost?: number; avg_cost_per_asset?: number;
  min_cost_estimate?: number; max_cost_estimate?: number; currency?: string;
  actual_cost_3m?: number;
  total_maintenance_events_3m?: number; avg_downtime_hours?: number;
  maintenance_type_breakdown?: Record<string, number>;
  monthly_maintenance_trend?: { month: string; cost: number; events: number }[];
  maintenance_trend_direction?: string; cost_trend_direction?: string;
  maintenance_data_concentrated?: boolean;
  scored_assets?: number; unscored_assets?: number;
  total_tickets?: number; open_tickets?: number; in_progress_tickets?: number;
  active_tickets?: number; resolved_tickets?: number; closed_tickets?: number;
  high_priority_active_tickets?: number;
  ticket_priority_breakdown?: Record<string, number>;
  ticket_final_priority_breakdown?: Record<string, number>;
  ticket_category_breakdown?: Record<string, number>;
  ticket_trend_last_3m?: { month: string; tickets: number }[];
  ticket_trend_direction?: string;
  total_users?: number; active_users?: number; inactive_users?: number;
  admin_users?: number; standard_users?: number;
  // Phase B extended DB fields
  fleet_age_distribution?: Record<string, number>;
  warranty_expiring_90d?: number;
  component_health?: { avg_tire?: number; avg_brake?: number; avg_battery?: number; avg_oil?: number; avg_hydraulic?: number };
  total_fault_codes?: number;
  avg_fault_codes_per_asset?: number;
  monitored_assets?: number;
  vendor_breakdown?: { vendor: string; events: number; cost: number }[];
  avg_resolution_hours?: number;
  avg_resolution_days?: number;
  mttr_by_priority?: { priority: string; avg_hours: number }[];
  // FRSO survival analysis (Weibull AFT) aggregated over critical assets.
  // Uses the shared type rather than re-declaring the shape inline — the
  // duplicate had drifted from the real response (it marked avg_fail_prob_*
  // optional when the backend always sends them, and omitted `assets` and
  // `generated_at` entirely).
  survival_summary?: SurvivalSummary | null;
}

interface MaintenanceScheduleItem {
  asset: string;
  predicted: number;
  scheduled: number;
}

interface Props {
  open: boolean;
  generating: boolean;
  reportData: { ai_sections: AISections; context: Ctx; kb_annotations?: any } | null;
  reportError: string | null;
  maintenanceSchedule?: MaintenanceScheduleItem[];
  onGenerate: () => void;
  onClose: () => void;
  onRegenerate: () => void;
}

// ── Helpers ───────────────────────────────────────────────

function toChart(obj?: Record<string, number>) {
  return obj ? Object.entries(obj).map(([name, value]) => ({ name, value })) : [];
}
function fmtM(n: number) { return (n / 1_000_000).toFixed(1); }

function CLabel({ text }: { text: string }) {
  return <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{text}</p>;
}

function AIBlock({ text }: { text?: string }) {
  if (!text) return <p className="text-sm italic text-muted-foreground">No content generated.</p>;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{text}</p>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

function KpiRow({ label, val, color }: { label: string; val?: string | number; color?: string }) {
  return (
    <div className="flex items-center justify-between text-xs py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold" style={color ? { color } : {}}>{val ?? "–"}</span>
    </div>
  );
}

function CTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-3 py-2 text-xs shadow-lg">
      {label && <div className="font-semibold mb-1">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || p.fill }}>
          {p.name ?? "Value"}: <strong>{(p.value as number)?.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

function Section({
  icon: Icon, title, subtitle, accent, children,
}: {
  icon: React.ElementType; title: string; subtitle: string;
  accent: string; children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <button type="button" onClick={() => setCollapsed((p) => !p)} className="w-full text-left">
        <div className="flex items-center gap-4 px-6 py-4" style={{ background: `linear-gradient(135deg, ${accent}14, ${accent}04)` }}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${accent}1a`, color: accent }}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          </div>
          {collapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {!collapsed && <div className="px-6 py-5 space-y-4">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CONFIRM STEP
// ─────────────────────────────────────────────────────────

function ConfirmStep({ onGenerate, onClose }: { onGenerate: () => void; onClose: () => void }) {
  const SECTIONS = [
    "Executive Insight Summary Fleet overview, health, costs, users",
    "Risk & Failure Analysis SHAP drivers, critical assets, risk distribution",
    "Maintenance Intelligence Service urgency, cost forecast, downtime",
    "Pattern & Trend Analysis 3-month ticket & maintenance trends",
    "Warehouse Conclusion Full RAG-powered summary with recommendations",
    "Asset component survival analysis predictions & remaining useful life",
  ];
  const SOURCES = [
    "assets", "asset_failure_predictions", "asset_cost_predictions",
    "maintenance_events", "tickets", "profiles", "prediction_explanations", "warehouses",
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Generate Warehouse Report</h2>
            <p className="text-sm text-violet-200">Complete analysis · Live data</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Report Includes 6 Sections</p>
          <div className="space-y-2">
            {SECTIONS.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-950 text-violet-600 text-[10px] font-bold mt-0.5">{i + 1}</span>
                <p className="text-xs text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Sources</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SOURCES.map((s) => (
              <span key={s} className="rounded-md bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 text-[10px] font-mono text-violet-700 dark:text-violet-300">{s}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 px-4 py-3">
          <Cpu className="h-4 w-4 shrink-0 text-indigo-500" />
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            All live data is processed and analyzed via PredictiX.
            Report generation takes approximately <strong>10–25 seconds</strong>.
          </p>
        </div>
      </div>

      <div className="flex gap-3 px-8 py-5 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <button onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
        <button
          onClick={onGenerate}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-bold text-white hover:from-violet-700 hover:to-indigo-700 transition-colors shadow-sm"
        >
          <Brain className="h-4 w-4" />
          Generate Full Report
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LOADING STEP
// ─────────────────────────────────────────────────────────

function LoadingStep() {
  const steps = React.useMemo(() => [
    "Connecting to database…",
    "Aggregating asset health & failure data…",
    "Processing ticket & maintenance records…",
    "Analyzing data patterns…",
    "Generating report sections…",
  ], []);
  
  const [step, setStep] = React.useState(0);
  
  React.useEffect(() => {
    if (!steps || steps.length === 0) return;

    const t = setInterval(() => {
      setStep((p) => (p < steps.length - 1 ? p + 1 : p));
    }, 3500);

    return () => clearInterval(t);
  }, [steps]);

  return (
    <div className="flex flex-col h-full items-center justify-center gap-6 px-8 py-12">
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
          <Brain className="h-9 w-9 text-violet-600" />
        </div>
        <div className="absolute -inset-1 rounded-full border-2 border-violet-200 dark:border-violet-800 animate-ping opacity-40" />
      </div>
      <div className="text-center max-w-sm">
        <h3 className="text-lg font-bold mb-1">Generating Report</h3>
        <p className="text-sm text-muted-foreground mb-6">Powered by PredictiX</p>
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs transition-all duration-500 ${
              i === step ? "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 font-medium"
              : i < step ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground/40"}`}>
              {i < step
                ? <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                : i === step
                ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                : <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-200 dark:border-slate-700" />
              }
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ERROR STEP
// ─────────────────────────────────────────────────────────

function ErrorStep({ error, onRetry, onClose }: { error: string; onRetry: () => void; onClose: () => void }) {
  const isApiKey = error.toLowerCase().includes("api key") || error.includes("api_key") || error.includes("401");
  return (
    <div className="flex flex-col h-full items-center justify-center gap-5 px-8 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950">
        <XCircle className="h-8 w-8 text-rose-600" />
      </div>
      <div className="text-center max-w-md">
        <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 mb-2">Report Generation Failed</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        {isApiKey && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-4 text-xs text-left space-y-2">
            <p className="font-bold text-amber-700 dark:text-amber-400">🔑 Fix: Add your Groq API Key</p>
            <ol className="space-y-1 text-amber-700 dark:text-amber-300 list-decimal list-inside">
              <li>Go to <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="underline font-medium">console.groq.com</a> and create a free API key</li>
              <li>Open <code className="rounded bg-amber-100 dark:bg-amber-900 px-1">PredictiX_backend/.env</code></li>
              <li>Add: <code className="rounded bg-amber-100 dark:bg-amber-900 px-1">GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxx</code></li>
              <li>The backend will reload automatically</li>
            </ol>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Close</button>
        <button onClick={onRetry} className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors">
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// REPORT STEP
// ─────────────────────────────────────────────────────────

function ReportStep({
  data, onRegenerate, onClose, maintenanceSchedule = [],
}: {
  data: { ai_sections: AISections; context: Ctx; kb_annotations?: any };
  onRegenerate: () => void;
  onClose: () => void;
  maintenanceSchedule?: MaintenanceScheduleItem[];
}) {
  const [sourcesOpen, setSourcesOpen] = React.useState(false);
  const [pdfLoading, setPdfLoading] = React.useState(false);
  const reportContentRef = React.useRef<HTMLDivElement>(null);
  const ctx = data.context;
  const ai  = data.ai_sections;
  const kb  = data.kb_annotations || {};
  const cur = ctx.currency ?? "LKR";

  // ── Asset summary selection ──────────────────────────────
  // User ticks the critical assets they want AI summaries for; only the
  // ticked assets are summarised, and only those summaries reach the PDF.
  const criticalAssets = ctx.critical_assets ?? [];
  const [selectedCodes, setSelectedCodes] = React.useState<Set<string>>(new Set());
  const [summaries, setSummaries] = React.useState<Record<string, string>>({});
  const [summarizing, setSummarizing] = React.useState(false);

  const toggleAsset = (code: string) =>
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });

  const allSelected = criticalAssets.length > 0 && selectedCodes.size === criticalAssets.length;
  const toggleAll = () =>
    setSelectedCodes(allSelected ? new Set() : new Set(criticalAssets.map((a) => a.code)));

  const generateSummaries = async () => {
    const targets = criticalAssets.filter((a) => selectedCodes.has(a.code));
    if (targets.length === 0) return;
    setSummarizing(true);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = typeof window !== "undefined"
      ? (localStorage.getItem("token") || localStorage.getItem("predictix.access_token"))
      : null;
    const results: Record<string, string> = {};
    await Promise.allSettled(
      targets.map(async (asset) => {
        try {
          const input = [
            `Vehicle: ${asset.code}`,
            `Type: ${asset.type}`,
            `Status: ${asset.status}`,
            `Health score: ${asset.health}`,
            `Failure probability: ${asset.failure_prob}`,
            `Risk: ${asset.risk}`,
            asset.days_to_service != null
              ? `Service due in: ${asset.days_to_service} day${asset.days_to_service === 1 ? "" : "s"}`
              : "",
            asset.primary_driver ? `Primary driver: ${asset.primary_driver}` : "",
          ].filter(Boolean).join(" | ");
          const res = await fetch(`${API_BASE}/asset-summaries/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ input_text: input }),
          });
          if (res.ok) {
            const d = await res.json();
            results[asset.code] = d.summary;
          } else {
            console.warn(`[AssetSummary] ✗ Failed for ${asset.code}: Status ${res.status}`);
          }
        } catch (err) {
          console.error(`[AssetSummary] ✗ Error for ${asset.code}:`, err);
        }
      })
    );
    setSummaries((prev) => ({ ...prev, ...results }));
    setSummarizing(false);
  };

  const riskData        = toChart(ctx.risk_breakdown);
  const healthDistData  = toChart(ctx.health_score_distribution);
  const assetTypeData   = toChart(ctx.asset_type_breakdown);
  const assetStatusData = toChart(ctx.asset_status_breakdown);
  const ticketPriData   = toChart(ctx.ticket_priority_breakdown);
  const ticketCatData   = toChart(ctx.ticket_category_breakdown).slice(0, 6);
  const maintenTypeData = toChart(ctx.maintenance_type_breakdown);
  const ticketTrend     = ctx.ticket_trend_last_3m ?? [];
  const maintenTrend    = ctx.monthly_maintenance_trend ?? [];
  const shapData        = (ctx.top_shap_features ?? []).slice(0, 6).map(([f, c]) => ({
    name: f.replace(/_/g, " ").slice(0, 22), value: c,
  }));

  const handlePDFExport = async () => {
    setPdfLoading(true);
    const warehouseName = ctx.warehouse_name || "Warehouse";
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const filename = `${warehouseName}-Report-${new Date().toISOString().split('T')[0]}.pdf`;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = typeof window !== "undefined"
      ? (localStorage.getItem("token") || localStorage.getItem("predictix.access_token"))
      : null;

    // Only the assets the user ticked (and summarised) carry a summary into the PDF.
    const summaryMap: Record<string, string> = summaries;
    console.log("[AssetSummary] Including", Object.keys(summaryMap).length, "ticked asset summaries in PDF");

    // Prepare structured report data with ALL warehouse context data
    const pdfData = {
      title: "Warehouse Report",
      warehouseName: warehouseName,
      warehouseCity: ctx.warehouse_city,
      generatedDate: date,
      summary: {
        totalAssets: ctx.total_assets || 0,
        fleetHealth: Math.round(ctx.avg_health_pct || 0),
        failureProb: Math.round(ctx.avg_failure_prob_pct || 0),
        critical: ctx.critical_count || 0,
        urgent: ctx.urgent_maintenance_count || 0,
        activeTickets: ctx.active_tickets || 0,
        activeUsers: ctx.active_users || 0,
        maintenanceCost: `LKR ${(ctx.total_estimated_cost || 0).toLocaleString()}`,
      },
      kbAnnotations: kb,
      aiContent: {
        insight_summary: ai.insight_summary || "",
        risk_analysis: ai.risk_analysis || "",
        maintenance_intelligence: ai.maintenance_intelligence || "",
        pattern_and_trend: ai.pattern_and_trend || "",
        conclusion: ai.conclusion || "",
      },
      assetDetail: {
        activeAssets: ctx.active_assets || 0,
        inactiveAssets: ctx.inactive_assets || 0,
        underMaintenanceAssets: ctx.under_maintenance_assets || 0,
        retiredAssets: ctx.retired_assets || 0,
        avgVehicleAge: ctx.avg_vehicle_age_years || 0,
        // Phase B additions
        fleetAgeDist: ctx.fleet_age_distribution ?? {},
        warrantyExpiring90d: ctx.warranty_expiring_90d ?? 0,
      },
      maintenanceDetail: {
        estimatedCost: `LKR ${(ctx.total_estimated_cost || 0).toLocaleString()}`,
        avgCostPerAsset: `LKR ${(ctx.avg_cost_per_asset || 0).toLocaleString()}`,
        actualCost3m: `LKR ${(ctx.actual_cost_3m || 0).toLocaleString()}`,
        maintenanceEvents3m: ctx.total_maintenance_events_3m || 0,
        avgDowntimeHours: ctx.avg_downtime_hours || 0,
        // Phase A fixes previously unmapped
        preventiveCount: ctx.maintenance_type_breakdown?.['Preventive'] ?? ctx.maintenance_type_breakdown?.['preventive'] ?? 0,
        correctiveCount: ctx.maintenance_type_breakdown?.['Corrective'] ?? ctx.maintenance_type_breakdown?.['corrective'] ?? 0,
        monthlyTrend: ctx.monthly_maintenance_trend ?? [],
        // Phase A fix cost range was in Ctx but never sent to PDF
        minCostEstimate: ctx.min_cost_estimate ?? 0,
        maxCostEstimate: ctx.max_cost_estimate ?? 0,
        // Phase B addition
        vendorBreakdown: ctx.vendor_breakdown ?? [],
        // Trend honesty: deterministic directions + seed-data concentration flag
        eventTrendDirection: ctx.maintenance_trend_direction,
        costTrendDirection: ctx.cost_trend_direction,
        dataConcentrated: ctx.maintenance_data_concentrated ?? false,
        reportingPeriod: ctx.period,
      },
      ticketDetail: {
        totalTickets: ctx.total_tickets || 0,
        openTickets: ctx.open_tickets || 0,
        inProgressTickets: ctx.in_progress_tickets || 0,
        resolvedTickets: ctx.resolved_tickets || 0,
        closedTickets: ctx.closed_tickets || 0,
        highPriorityTickets: ctx.high_priority_active_tickets || 0,
        mediumPriorityTickets: ctx.ticket_priority_breakdown?.['Medium'] || 0,
        lowPriorityTickets: ctx.ticket_priority_breakdown?.['Low'] || 0,
        // Phase A fix previously unmapped
        monthlyTrend: ctx.ticket_trend_last_3m ?? [],
        // Phase B additions
        avgResolutionDays: ctx.avg_resolution_days ?? 0,
        mttrByPriority: ctx.mttr_by_priority ?? [],
        // AI reclassified priority
        finalPriorityBreakdown: ctx.ticket_final_priority_breakdown ?? {},
      },
      userDetail: {
        totalUsers: ctx.total_users || 0,
        adminUsers: ctx.admin_users || 0,
        standardUsers: ctx.standard_users || 0,
        inactiveUsers: ctx.inactive_users || 0,
      },
      // Phase B Component & Operational data
      operationsDetail: {
        componentHealth: ctx.component_health ?? {},
        totalFaultCodes: ctx.total_fault_codes ?? 0,
        avgFaultCodesPerAsset: ctx.avg_fault_codes_per_asset ?? 0,
        monitoredAssets: ctx.monitored_assets ?? 0,
      },
      // Predictive Maintenance Schedule (from /maintenance-schedule endpoint warehouse only)
      maintenanceSchedule: maintenanceSchedule.slice(0, 20),
      // Chart Sections
      sections: {
        assetStatus: Object.entries(ctx.asset_status_breakdown || {}).map(([name, value]) => ({ name, value })),
        ticketPriority: toChart(ctx.ticket_priority_breakdown || {}),
        ticketsByCategory: toChart(ctx.ticket_category_breakdown || {}),
        assetsByType: toChart(ctx.asset_type_breakdown || {}),
        healthScoreDistribution: Object.entries(ctx.health_score_distribution || {}).map(([bucket, count]) => ({ bucket, count })),
        maintenanceTypes: Object.entries(ctx.maintenance_type_breakdown || {}).map(([name, value]) => ({ name, value })),
        riskBreakdown: Object.entries(ctx.risk_breakdown || {}).map(([name, value]) => ({ name, value })),
        criticalAssets: (ctx.critical_assets || []).map(asset => ({
          id: asset.code || "N/A",
          vehicle: asset.name || "Unknown",
          component: asset.type || "General",
          health: asset.health || "N/A",
          priority: Math.round(parseFloat(asset.failure_prob || "0")) > 50 ? "High" : "Medium",
          status: asset.status || "Unknown",
          summary: summaryMap[asset.code] || undefined,
        })),
      },
      trends: {
        ticketTrend: ctx.ticket_trend_last_3m || [],
        maintenanceTrend: ctx.monthly_maintenance_trend || [],
      },
      shapFeatures: (ctx.top_shap_features || []).slice(0, 8).map(([feature, importance]) => ({
        feature: feature.replace(/_/g, " "),
        importance: importance,
      })),
      // FRSO survival analysis (Weibull AFT) §4.8 dedicated page
      survival: ctx.survival_summary ?? null,
    };
    // const pdfData = {
    //   title: "Warehouse Report",
    //   warehouseName: warehouseName,
    //   warehouseCity: ctx.warehouse_city,
    //   generatedDate: date,
    //   summary: {
    //     totalAssets: ctx.total_assets || 0,
    //     fleetHealth: Math.round(ctx.avg_health_pct || 0),
    //     failureProb: Math.round(ctx.avg_failure_prob_pct || 0),
    //     critical: ctx.critical_count || 0,
    //     urgent: ctx.urgent_count || 0,
    //     activeTickets: ctx.active_tickets || 0,
    //     activeUsers: ctx.active_users || 0,
    //     maintenanceCost: `LKR ${(ctx.monthly_maintenance_cost || 0).toLocaleString()}`,
    //   },
    //   kbAnnotations: kb,
    //   // AI Content Sections - from data parameter
    //   aiContent: {
    //     insight_summary: ai.insight_summary || "",
    //     risk_analysis: ai.risk_analysis || "",
    //     maintenance_intelligence: ai.maintenance_intelligence || "",
    //     pattern_and_trend: ai.pattern_and_trend || "",
    //     conclusion: ai.conclusion || "",
    //   },
    //   // Asset Details
    //   assetDetail: {
    //     activeAssets: ctx.active_assets || 0,
    //     inactiveAssets: ctx.inactive_assets || 0,
    //     underMaintenanceAssets: ctx.under_maintenance_assets || 0,
    //     retiredAssets: ctx.retired_assets || 0,
    //     avgVehicleAge: ctx.avg_vehicle_age_years || 0,
    //   },
    //   // Maintenance Details
    //   maintenanceDetail: {
    //     estimatedCost: `LKR ${(ctx.total_estimated_cost || 0).toLocaleString()}`,
    //     avgCostPerAsset: `LKR ${(ctx.avg_cost_per_asset || 0).toLocaleString()}`,
    //     actualCost3m: `LKR ${(ctx.actual_cost_3m || 0).toLocaleString()}`,
    //     maintenanceEvents3m: ctx.total_maintenance_events_3m || 0,
    //     avgDowntimeHours: ctx.avg_downtime_hours || 0,
    //   },
    //   // Ticket Details
    //   ticketDetail: {
    //     totalTickets: ctx.total_tickets || 0,
    //     openTickets: ctx.open_tickets || 0,
    //     inProgressTickets: ctx.in_progress_tickets || 0,
    //     resolvedTickets: ctx.resolved_tickets || 0,
    //     closedTickets: ctx.closed_tickets || 0,
    //     highPriorityTickets: ctx.high_priority_active_tickets || 0,
    //     mediumPriorityTickets: ctx.ticket_priority_breakdown?.['Medium'] || ctx.ticket_final_priority_breakdown?.['Medium'] || 0,
    //     lowPriorityTickets: ctx.ticket_priority_breakdown?.['Low'] || ctx.ticket_final_priority_breakdown?.['Low'] || 0,
    //   },
    //   // User Details
    //   userDetail: {
    //     totalUsers: ctx.total_users || 0,
    //     adminUsers: ctx.admin_users || 0,
    //     standardUsers: ctx.standard_users || 0,
    //     inactiveUsers: ctx.inactive_users || 0,
    //   },
    //   // Chart Sections
    //   sections: {
    //     assetStatus: Object.entries(ctx.asset_status_breakdown || {}).map(([name, value]) => ({ name, value })),
    //     ticketPriority: toChart(ctx.ticket_priority_breakdown || {}),
    //     ticketsByCategory: toChart(ctx.ticket_category_breakdown || {}),
    //     assetsByType: toChart(ctx.asset_type_breakdown || {}),
    //     healthScoreDistribution: Object.entries(ctx.health_score_distribution || {}).map(([bucket, count]) => ({ bucket, count })),
    //     maintenanceTypes: Object.entries(ctx.maintenance_type_breakdown || {}).map(([name, value]) => ({ name, value })),
    //     riskBreakdown: Object.entries(ctx.risk_breakdown || {}).map(([name, value]) => ({ name, value })),
    //     criticaAssets: (ctx.critical_assets || []).map(asset => ({
    //       id: asset.code || "N/A",
    //       vehicle: asset.name || "Unknown",
    //       component: asset.type || "General",
    //       health: asset.health || "N/A",
    //       priority: Math.round(parseFloat(asset.failure_prob || "0")) > 50 ? "High" : "Medium",
    //       status: asset.status || "Unknown",
    //     })),
    //   },
    //   // Trends Data
    //   trends: {
    //     ticketTrend: ctx.ticket_trend_last_3m || [],
    //     maintenanceTrend: ctx.monthly_maintenance_trend || [],
    //   },
    //   // SHAP Features (Top Failure Drivers)
    //   shapFeatures: (ctx.top_shap_features || []).slice(0, 8).map(([feature, importance]) => ({
    //     feature: feature.replace(/_/g, " "),
    //     importance: importance,
    //   })),
    // };
    
    downloadProfessionalPDF(pdfData as any, filename);
    setPdfLoading(false);

    // Trigger Server Notification
    if (token) {
      fetch(`${API_BASE}/warehouse-dashboard/notify-print`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(e => console.error("Failed to notify report print:", e));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <div>
              <h2 className="text-sm font-bold">Warehouse Full Report</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {ctx.warehouse_name} · {ctx.warehouse_city} · {ctx.report_date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePDFExport} disabled={pdfLoading} className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {pdfLoading ? "Generating…" : "PDF"}
          </button>
          <button onClick={onRegenerate} className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Regenerate
          </button>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div ref={reportContentRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">

        {/* RAG sources */}
        {sourcesOpen && (
          <div className="rounded-2xl border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/20 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-2">PostgreSQL Tables Injected into Context</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-violet-700 dark:text-violet-300 sm:grid-cols-3">
              <span>assets {ctx.total_assets}</span>
              <span>asset_failure_predictions</span>
              <span>asset_cost_predictions</span>
              <span>maintenance_events {ctx.total_maintenance_events_3m} (90d)</span>
              <span>tickets {ctx.total_tickets}</span>
              <span>profiles {ctx.total_users}</span>
            </div>
          </div>
        )}

        {/* KPI strip */}
        <div className="flex flex-wrap gap-2">
          {[
            { l: "Total Assets",   v: ctx.total_assets,                            c: P.violet },
            { l: "Fleet Health",   v: `${ctx.avg_health_pct}%`,                    c: P.emerald },
            { l: "Failure Prob",   v: `${ctx.avg_failure_prob_pct}%`,              c: P.rose },
            { l: "Critical",       v: ctx.critical_count,                           c: P.rose },
            { l: "Urgent ≤7d",     v: ctx.urgent_maintenance_count,                 c: P.amber },
            { l: "Active Tickets", v: ctx.active_tickets,                           c: P.sky },
            { l: "Active Users",   v: ctx.active_users,                             c: P.indigo },
            { l: "Est Cost",       v: `${cur} ${fmtM(ctx.total_estimated_cost ?? 0)}M`, c: P.teal },
          ].map(({ l, v, c }) => (
            <div key={l} className="flex flex-col items-center rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-4 py-2.5">
              <span className="text-lg font-bold" style={{ color: c }}>{v}</span>
              <span className="text-[10px] text-muted-foreground">{l}</span>
            </div>
          ))}
        </div>

        {/* ── S1: Executive Summary ── */}
        <Section icon={Brain} accent={P.violet} title="1. Executive Insight Summary" subtitle="Top-level AI intelligence & benchmark context">
          <AIBlock text={ai.insight_summary} />
          {kb.benchmark_alerts?.map((a: any, i: number) => (
            <div key={i} className="my-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
              <span className="font-bold flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Benchmark Alert</span>
              <p className="mt-1">{a.message}</p>
            </div>
          ))}
        </Section>

        {/* ── S2: Fleet Asset Overview ── */}
        <Section icon={ClipboardList} accent={P.sky} title="2. Fleet Asset Overview" subtitle="Status distribution · Fleet compilation">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Asset Status + Table */}
            {assetStatusData.length > 0 && (
              <div className="min-w-0 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/30 dark:bg-slate-900/10">
                <CLabel text="Asset Status Distribution" />
                <div className="flex flex-col xl:flex-row items-center gap-4 mt-2">
                  <div className="w-full xl:w-1/2">
                    <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height={160}>
                      <PieChart>
                        <Pie data={assetStatusData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                          {assetStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CTip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full xl:w-1/2 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="pb-2 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                          <th className="pb-2 text-right font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Count</th>
                          <th className="pb-2 text-right font-bold text-muted-foreground uppercase tracking-wider text-[10px]">% Fleet</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assetStatusData.map((d, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800/80">
                            <td className="py-2.5 flex items-center gap-2 font-medium capitalize">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                              {d.name.replace(/_/g, " ")}
                            </td>
                            <td className="py-2.5 text-right font-semibold">{d.value}</td>
                            <td className="py-2.5 text-right text-muted-foreground">{Math.round(((d.value ?? 0) / Math.max(ctx.total_assets ?? 0, 1)) * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Assets By Type + Table */}
            {assetTypeData.length > 0 && (
              <div className="min-w-0 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/30 dark:bg-slate-900/10">
                <CLabel text="Fleet Composition by Type" />
                <div className="flex flex-col xl:flex-row items-center gap-4 mt-2">
                  <div className="w-full xl:w-1/2">
                    <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height={160}>
                      <BarChart data={assetTypeData} layout="vertical" margin={{ left: 70, right: 20, top: 10, bottom: 0 }}>
                        <XAxis type="number" tick={{ fontSize: 10 }} hide />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={65} axisLine={false} tickLine={false} />
                        <Tooltip content={<CTip />} />
                        <Bar dataKey="value" fill={P.sky} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full xl:w-1/2 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="pb-2 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Asset Type</th>
                          <th className="pb-2 text-right font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Units</th>
                          <th className="pb-2 text-right font-bold text-muted-foreground uppercase tracking-wider text-[10px]">% Fleet</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assetTypeData.slice(0, 4).map((d, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800/80">
                            <td className="py-2.5 font-medium capitalize text-slate-700 dark:text-slate-300">
                               <div className="flex flex-col">
                                 <span>{d.name.replace(/_/g, " ")}</span>
                               </div>
                            </td>
                            <td className="py-2.5 text-right font-semibold text-slate-800 dark:text-slate-200">{d.value}</td>
                            <td className="py-2.5 text-right text-muted-foreground">{Math.round(((d.value ?? 0) / Math.max(ctx.total_assets ?? 0, 1)) * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <div className="min-w-0 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
              <CLabel text="Workforce Structure" />
              <div className="space-y-2 mt-3">
                {[
                  { l: "Total Users",    v: ctx.total_users,    c: P.slate },
                  { l: "Active",         v: ctx.active_users,   c: P.emerald },
                  { l: "Inactive",       v: ctx.inactive_users, c: P.slate },
                  { l: "Admin & Standards", v: `${ctx.admin_users} / ${ctx.standard_users}`, c: P.violet },
                ].map(({ l, v, c }) => <KpiRow key={l} label={l} val={v} color={c} />)}
              </div>
            </div>

            {kb.service_interval_text && (
              <div className="min-w-0 rounded-2xl border border-sky-200 bg-sky-50 dark:border-sky-900/50 dark:bg-sky-950/20 p-5 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sky-800 dark:text-sky-300">Service Interval Standard</span>
                </div>
                <p className="text-xs text-sky-700 dark:text-sky-400 italic leading-relaxed">
                  "{kb.service_interval_text}"
                </p>
              </div>
            )}
          </div>

          {/* Fleet Age Distribution */}
          {Object.keys(ctx.fleet_age_distribution ?? {}).length > 0 && (
            <>
              <Divider label="Fleet Age Distribution" />
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(ctx.fleet_age_distribution ?? {}).map(([band, cnt]) => {
                  const total = Object.values(ctx.fleet_age_distribution ?? {}).reduce((a, b) => a + (b as number), 0);
                  const pct = total > 0 ? Math.round((cnt as number) / total * 100) : 0;
                  const isOld = band.startsWith('10');
                  return (
                    <div key={band} className="rounded-xl border p-3 text-center" style={{ borderColor: isOld && pct > 20 ? '#fca5a5' : '#e2e8f0', background: isOld && pct > 20 ? '#fff5f5' : undefined }}>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{band}</div>
                      <div className="text-xl font-bold" style={{ color: isOld && pct > 20 ? '#dc2626' : isOld && pct > 10 ? '#ea580c' : P.teal }}>{cnt as number}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{pct}% of fleet</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Warranty Expiry Alert */}
          {(ctx.warranty_expiring_90d ?? 0) > 0 && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 flex items-start gap-3 mt-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                <strong>{ctx.warranty_expiring_90d} {(ctx.warranty_expiring_90d ?? 0) === 1 ? 'asset has' : 'assets have'}</strong> warranty expiring within the next 90 days. Schedule pre-expiry inspections.
              </p>
            </div>
          )}
        </Section>

        {/* ── S3: Health & Risk Analysis ── */}
        <Section icon={AlertTriangle} accent={P.rose} title="3. Health & Risk Analysis" subtitle="AI-identified risks · SHAP drivers · Critical asset table">
          <AIBlock text={ai.risk_analysis} />
          <Divider label="Risk Distribution" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {riskData.length > 0 && (
              <div>
                <CLabel text="Risk Levels" />
                <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height={155}>
                  <PieChart>
                    <Pie data={riskData} cx="50%" cy="50%" innerRadius={30} outerRadius={58} paddingAngle={3} dataKey="value">
                      {riskData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CTip />} />
                    <Legend iconType="circle" iconSize={7} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {healthDistData.length > 0 && (
              <div>
                <CLabel text="Health Score Buckets" />
                <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height={155}>
                  <BarChart data={healthDistData} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<CTip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {healthDistData.map((_, i) => (
                        <Cell key={i} fill={[P.emerald, P.sky, P.amber, P.amber, P.rose][i] || P.slate} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {kb.shap_enriched && kb.shap_enriched.length > 0 ? (
              <div className="lg:col-span-2">
                <CLabel text="Enriched SHAP Failure Drivers" />
                <div className="mt-2 space-y-2">
                  {kb.shap_enriched.slice(0, 4).map((f: any, i: number) => (
                    <div key={i} className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-800/20 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{f.feature}</span>
                        <span className="font-bold text-rose-600">{f.impact_pct}%</span>
                      </div>
                      <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                        <span><span className="font-semibold text-amber-600">Threshold:</span> {f.kb_threshold}</span>
                        <span><span className="font-semibold text-emerald-600">Action:</span> {f.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : shapData.length > 0 ? (
              <div>
                <CLabel text="Top SHAP Failure Drivers" />
                <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height={200}>
                  <BarChart data={shapData} layout="vertical" margin={{ left: 130, right: 20, top: 10, bottom: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip content={<CTip />} />
                    <Bar dataKey="value" fill={P.rose} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </div>




        </Section>

        {/* ── S4: Maintenance ── */}
        <Section icon={Wrench} accent={P.amber} title="4. Maintenance Intelligence" subtitle="Service urgency · Cost predictions · Downtime analysis">
          <AIBlock text={ai.maintenance_intelligence} />
          <Divider label="Service Urgency & Costs" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              {[
                { l: "Urgent ≤7 days",            v: ctx.urgent_maintenance_count,       c: P.rose },
                { l: "Service ≤30 days",           v: ctx.soon_maintenance_count,         c: P.amber },
                { l: "Avg Days to Service",        v: ctx.avg_days_to_maintenance ?? "N/A", c: P.sky },
                { l: "Events (3 months)",          v: ctx.total_maintenance_events_3m,    c: P.teal },
                { l: "Avg Downtime/Event",         v: `${ctx.avg_downtime_hours}h`,       c: P.slate },
                { l: `Est. Cost (${cur})`,         v: (ctx.total_estimated_cost ?? 0).toLocaleString(),   c: P.violet },
                { l: `Min Estimate (${cur})`,      v: (ctx.min_cost_estimate ?? 0).toLocaleString(),      c: P.sky },
                { l: `Max Estimate (${cur})`,      v: (ctx.max_cost_estimate ?? 0).toLocaleString(),      c: P.rose },
                { l: `Actual Spend 3M (${cur})`,   v: (ctx.actual_cost_3m ?? 0).toLocaleString(),         c: P.emerald },
                { l: `Avg per Asset (${cur})`,     v: (ctx.avg_cost_per_asset ?? 0).toLocaleString(),     c: P.indigo },
              ].map(({ l, v, c }) => <KpiRow key={l} label={l} val={v} color={c} />)}
            </div>
            {maintenTypeData.length > 0 && (
              <div>
                <CLabel text="Event Types" />
                <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height={160}>
                  <PieChart>
                    <Pie data={maintenTypeData} cx="50%" cy="50%" outerRadius={57} dataKey="value">
                      {maintenTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CTip />} />
                    <Legend iconType="circle" iconSize={7} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          {maintenTrend.length > 0 && (
            <>
              <Divider label="Monthly Events (3 Months)" />
              <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height={150}>
                <LineChart data={maintenTrend} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CTip />} />
                  <Line type="monotone" dataKey="events" name="Events" stroke={P.amber} strokeWidth={2.5} dot={{ r: 4, fill: P.amber }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}

          {/* Vendor Analysis */}
          {(ctx.vendor_breakdown?.length ?? 0) > 0 && (
            <>
              <Divider label="Vendor & Service Provider Analysis" />
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {["Vendor", "Events", `Total Cost (${cur})`].map(h => (
                        <th key={h} className="pb-2 pr-4 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ctx.vendor_breakdown!.map((v, i) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-2 pr-4 font-medium">{v.vendor}</td>
                        <td className="py-2 pr-4 font-semibold" style={{ color: P.amber }}>{v.events}</td>
                        <td className="py-2 font-semibold" style={{ color: P.emerald }}>{v.cost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Predictive Maintenance Schedule */}
          {maintenanceSchedule.length > 0 && (
            <>
              <Divider label="Predictive Maintenance Schedule (Predicted vs Scheduled)" />
              <p className="text-[11px] text-muted-foreground mb-3">
                Predicted weeks from ML model vs scheduled weeks from fleet average interval. Negative gap = overdue relative to schedule.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {["Asset", "Predicted (wks)", "Scheduled (wks)", "Gap (wks)", "Status"].map(h => (
                        <th key={h} className="pb-2 pr-3 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceSchedule.slice(0, 15).map((r, i) => {
                      const gap = r.predicted - r.scheduled;
                      const isOverdue = gap < -2;
                      const isDue = gap < 0 && !isOverdue;
                      const gapColor = isOverdue ? P.rose : isDue ? P.amber : P.emerald;
                      const statusLabel = isOverdue ? '⚠ Overdue' : isDue ? 'Due Soon' : 'On Track';
                      return (
                        <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="py-2 pr-3 font-medium text-xs">{r.asset}</td>
                          <td className="py-2 pr-3 font-semibold tabular-nums" style={{ color: P.sky }}>{r.predicted.toFixed(1)}</td>
                          <td className="py-2 pr-3 font-semibold tabular-nums" style={{ color: P.teal }}>{r.scheduled.toFixed(1)}</td>
                          <td className="py-2 pr-3 font-bold tabular-nums" style={{ color: gapColor }}>
                            {gap >= 0 ? '+' : ''}{gap.toFixed(1)}
                          </td>
                          <td className="py-2">
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{
                              backgroundColor: `${gapColor}20`, color: gapColor,
                            }}>{statusLabel}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Section>

        {/* ── S5: Ticket Management ── */}
        <Section icon={Database} accent={P.sky} title="5. Ticket Management Status" subtitle="3-month ticket trends · Priority & category breakdown">
          <AIBlock text={ai.pattern_and_trend} />
          
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <div>
              <CLabel text="Tickets Standing" />
              <div className="space-y-1.5 mt-1 border border-slate-100 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/50">
                {[
                  { l: "Open",              v: ctx.open_tickets,              c: P.amber },
                  { l: "In Progress",       v: ctx.in_progress_tickets,       c: P.sky },
                  { l: "Resolved",          v: ctx.resolved_tickets,          c: P.emerald },
                  { l: "Closed",            v: ctx.closed_tickets,            c: P.slate },
                  { l: "High Priority Active", v: ctx.high_priority_active_tickets, c: P.rose },
                ].map(({ l, v, c }) => <KpiRow key={l} label={l} val={v} color={c} />)}
              </div>
            </div>
            {ticketPriData.length > 0 && (
              <div>
                <CLabel text="Ticket Priority" />
                <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height={150}>
                  <PieChart>
                    <Pie data={ticketPriData} cx="50%" cy="50%" innerRadius={28} outerRadius={55} paddingAngle={3} dataKey="value">
                      {ticketPriData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CTip />} />
                    <Legend iconType="circle" iconSize={7} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          
          <Divider label="Ticket Trends" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ticketTrend.length > 0 && (
              <div className="lg:col-span-2">
                <CLabel text={`Monthly Ticket Volume (${ctx.ticket_trend_direction ?? "stable"})`} />
                <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height={150}>
                  <LineChart data={ticketTrend} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<CTip />} />
                    <Line type="monotone" dataKey="tickets" name="Tickets" stroke={P.sky} strokeWidth={2.5} dot={{ r: 4, fill: P.sky }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          {ticketCatData.length > 0 && (
            <>
              <Divider label="Ticket Categories" />
              <div className="grid gap-4 sm:grid-cols-2">
                <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height={200}>
                  <BarChart data={ticketCatData} layout="vertical" margin={{ left: 130, right: 20, top: 10, bottom: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip content={<CTip />} />
                    <Bar dataKey="value" fill={P.sky} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {ticketCatData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                         <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-muted-foreground truncate max-w-[130px]">{d.name}</span>
                      </div>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* MTTR / Resolution Performance */}
          {(ctx.avg_resolution_days ?? 0) > 0 && (
            <>
              <Divider label="Resolution Performance (MTTR)" />
              <div className="grid gap-3 sm:grid-cols-2 mb-3">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Resolution Time</span>
                  <span className="text-2xl font-bold" style={{ color: P.sky }}>{ctx.avg_resolution_days?.toFixed(1)} days</span>
                  <span className="text-[10px] text-muted-foreground">{ctx.avg_resolution_hours?.toFixed(1)} hours</span>
                </div>
                {(ctx.mttr_by_priority?.length ?? 0) > 0 && (
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Fastest Priority</span>
                    {ctx.mttr_by_priority!.slice(-1).map(p => (
                      <div key={p.priority}>
                        <span className="text-lg font-bold" style={{ color: P.emerald }}>{p.priority}</span>
                        <span className="text-xs text-muted-foreground ml-2">{p.avg_hours.toFixed(1)}h avg</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {(ctx.mttr_by_priority?.length ?? 0) > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        {["Priority", "Avg Resolution (hrs)"].map(h => (
                          <th key={h} className="pb-2 pr-4 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ctx.mttr_by_priority!.map((p, i) => (
                        <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="py-2 pr-4">
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{
                              backgroundColor: p.priority === 'High' ? `${P.rose}20` : p.priority === 'Medium' ? `${P.amber}20` : `${P.slate}20`,
                              color: p.priority === 'High' ? P.rose : p.priority === 'Medium' ? P.amber : P.slate,
                            }}>{p.priority}</span>
                          </td>
                          <td className="py-2 font-semibold" style={{ color: P.sky }}>{p.avg_hours.toFixed(1)}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* AI Priority Reclassification */}
          {Object.keys(ctx.ticket_final_priority_breakdown ?? {}).length > 0 && (
            <>
              <Divider label="AI Priority Reclassification" />
              <p className="text-[11px] text-muted-foreground mb-3">
                PredictiX AI re-scores each ticket using sensor telemetry and SHAP models. Compare against original filed priority to identify under-triaged issues.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(ctx.ticket_final_priority_breakdown ?? {}).map(([pri, cnt]) => {
                  const color = pri.toLowerCase() === 'high' || pri.toLowerCase() === 'critical'
                    ? P.rose : pri.toLowerCase() === 'medium' ? P.amber : P.emerald;
                  return (
                    <div key={pri} className="rounded-xl border p-3 text-center" style={{ borderColor: `${color}40`, background: `${color}10` }}>
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color }}>{pri}</div>
                      <div className="text-2xl font-bold" style={{ color }}>{cnt as number}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">AI-classified</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Section>

        {/* ── S6: Asset component survival analysis ── */}
        <Section icon={HeartPulse} accent={P.teal} title="6. Asset component survival analysis" subtitle="">
          {ctx.survival_summary && (
            <WarehouseSurvivalAnalysis data={ctx.survival_summary} isLoading={false} />
          )}
          
          <Divider label="Soonest-Failing Watchlist" />
          {(ctx.survival_summary?.watchlist?.length ?? 0) > 0 ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="text-[11px] text-muted-foreground">
              Tick the assets you want AI summaries for summaries appear below and are included in the PDF.
              {selectedCodes.size > 0 && <span className="ml-1 font-semibold text-violet-600">{selectedCodes.size} selected</span>}
            </p>
            <button
              type="button"
              onClick={generateSummaries}
              disabled={selectedCodes.size === 0 || summarizing}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {summarizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
              {summarizing ? "Summarising…" : "Summarise ticked assets"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-2 pr-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-3.5 w-3.5 cursor-pointer accent-violet-600"
                      title="Select all"
                    />
                  </th>
                  {["Asset", "Component", "Median RUL (days)", "Risk"].map((h) => (
                    <th key={h} className="pb-2 pr-3 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(ctx.survival_summary?.watchlist || []).map((w) => (
                  <React.Fragment key={w.asset}>
                    <tr className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 pr-3">
                        <input
                          type="checkbox"
                          checked={selectedCodes.has(w.asset)}
                          onChange={() => toggleAsset(w.asset)}
                          className="h-3.5 w-3.5 cursor-pointer accent-violet-600"
                        />
                      </td>
                      <td className="py-2 pr-3 font-mono font-bold text-rose-600">{w.asset}</td>
                      <td className="py-2 pr-3 font-medium">{w.component}</td>
                      <td className="py-2 pr-3 font-semibold">{w.rul_days == null ? '-' : w.rul_days.toLocaleString()}</td>
                      <td className="py-2 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${P.rose}20`, color: P.rose }}>
                          {w.risk}
                        </span>
                      </td>
                    </tr>
                    {summaries[w.asset] && (
                      <tr className="border-b border-slate-50 dark:border-slate-800/50 bg-violet-50/40 dark:bg-violet-950/10">
                        <td />
                        <td colSpan={4} className="py-2 pr-3">
                          <div className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                            <Brain className="h-3.5 w-3.5 shrink-0 mt-0.5 text-violet-500" />
                            <span><span className="font-semibold text-violet-600">AI Summary:</span> {summaries[w.asset]}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
            </>
          ) : <p className="text-sm text-muted-foreground italic text-center py-3">No critical assets found.</p>}
        </Section>

        {/* ── S7: Recommendations ── */}
        <Section icon={ShieldAlert} accent={P.emerald} title="7. Recommendations" subtitle="Data-driven prescriptive actions">
          {kb.recommendations ? (
            <div className="grid gap-4">
              {kb.recommendations.critical?.length > 0 && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 overflow-hidden text-xs">
                  <div className="bg-rose-600 px-3 py-1.5 font-bold text-white tracking-widest uppercase text-[10px]">Critical (0-7 Days)</div>
                  <ul className="px-5 py-3 list-disc space-y-1.5 text-rose-900 dark:text-rose-200">
                    {kb.recommendations.critical.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {kb.recommendations.high?.length > 0 && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 overflow-hidden text-xs">
                  <div className="bg-amber-500 px-3 py-1.5 font-bold text-white tracking-widest uppercase text-[10px]">High (7-30 Days)</div>
                  <ul className="px-5 py-3 list-disc space-y-1.5 text-amber-900 dark:text-amber-200">
                    {kb.recommendations.high.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {kb.recommendations.medium?.length > 0 && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 overflow-hidden text-xs">
                  <div className="bg-emerald-600 px-3 py-1.5 font-bold text-white tracking-widest uppercase text-[10px]">Medium (30-90 Days)</div>
                  <ul className="px-5 py-3 list-disc space-y-1.5 text-emerald-900 dark:text-emerald-200">
                    {kb.recommendations.medium.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">No recommendations generated.</p>
          )}
        </Section>

        {/* ── S8: Conclusion ── */}
        <Section icon={FileText} accent={P.indigo} title="8. Conclusion" subtitle="Overall summary and metric snapshots">
          <AIBlock text={ai.conclusion} />
          <Divider label="3-Month Dashboard Summary" />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Fleet", color: P.violet, icon: Activity,
                items: [
                  { l: "Total Assets", v: ctx.total_assets, c: P.violet },
                  { l: "Active", v: ctx.active_assets, c: P.emerald },
                  { l: "Inactive", v: ctx.inactive_assets, c: P.slate },
                  { l: "Avg Health", v: `${ctx.avg_health_pct}%`, c: (ctx.avg_health_pct ?? 0) > 70 ? P.emerald : P.rose },
                  { l: "Critical", v: ctx.critical_count, c: P.rose },
                ],
              },
              {
                title: "Tickets", color: P.sky, icon: ClipboardList,
                items: [
                  { l: "Total", v: ctx.total_tickets, c: P.slate },
                  { l: "Active", v: ctx.active_tickets, c: P.amber },
                  { l: "Open", v: ctx.open_tickets, c: P.amber },
                  { l: "In Progress", v: ctx.in_progress_tickets, c: P.sky },
                  { l: "High Priority", v: ctx.high_priority_active_tickets, c: P.rose },
                ],
              },
              {
                title: "Financials", color: P.emerald, icon: DollarSign,
                items: [
                  { l: `Est. Maint. (${cur})`, v: `${fmtM(ctx.total_estimated_cost ?? 0)}M`, c: P.violet },
                  { l: `Actual 3M (${cur})`, v: `${fmtM(ctx.actual_cost_3m ?? 0)}M`, c: P.emerald },
                  { l: "Avg/Asset", v: (ctx.avg_cost_per_asset ?? 0).toLocaleString(), c: P.slate },
                  { l: "Events (3m)", v: ctx.total_maintenance_events_3m, c: P.teal },
                  { l: "Avg Downtime", v: `${ctx.avg_downtime_hours}h`, c: P.slate },
                ],
              },
            ].map(({ title, color, icon: Icon, items }) => (
              <div key={title} className="rounded-2xl border p-4" style={{ borderColor: `${color}30`, background: `${color}08` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4" style={{ color }} />
                  <span className="text-xs font-bold" style={{ color }}>{title}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map(({ l, v, c }) => <KpiRow key={l} label={l} val={v} color={c} />)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 mt-4">
            <Clock className="h-5 w-5 text-rose-600 shrink-0" />
            <p className="text-xs text-rose-600 dark:text-rose-300">
              <strong>{ctx.urgent_maintenance_count}</strong> assets need service within 7 days · 
              <strong>{ctx.soon_maintenance_count}</strong> within 30 days · 
              Avg: <strong>{ctx.avg_days_to_maintenance ?? "N/A"} days</strong> to next service
            </p>
          </div>
        </Section>

        <div className="h-4" />
      </div>

      <style>{`
        @media print {
          /* Page setup - A4 dimensions */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
          }

          /* Hide interactive elements */
          button, nav, header, .flex.items-center.justify-between {
            display: none !important;
          }

          /* Main container */
          .flex.flex-col.h-full {
            page-break-after: always;
            page-break-inside: avoid;
          }

          /* Page setup - margins and size */
          body {
            margin: 0;
            padding: 15mm;
            background: white;
          }

          /* Section styling for page breaks */
          .rounded-2xl.border {
            page-break-inside: avoid;
            page-break-after: auto;
            margin-bottom: 12pt;
            page-break-before: auto;
          }

          /* Divider styling */
          .flex.items-center.gap-3.my-4 {
            page-break-inside: avoid;
            page-break-after: avoid;
          }

          /* KPI strip - no break inside */
          .flex.flex-wrap.gap-2 {
            page-break-inside: avoid;
            page-break-after: avoid;
            margin-bottom: 14pt;
          }

          /* Force page break after main sections */
          .rounded-2xl.border:nth-of-type(2),
          .rounded-2xl.border:nth-of-type(3),
          .rounded-2xl.border:nth-of-type(4) {
            page-break-after: always;
            margin-bottom: 20pt;
          }

          /* Chart containers - prevent breaking */
          .recharts-wrapper {
            page-break-inside: avoid;
            height: 180px !important;
            min-height: 180px !important;
          }

          /* Table styling for print */
          table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
            font-size: 9pt;
            margin-bottom: 12pt;
          }

          thead {
            display: table-header-group;
            page-break-after: avoid;
          }

          tbody tr {
            page-break-inside: avoid;
          }

          /* Text sizing for print */
          h1, h2, h3 { font-size: 14pt; margin-bottom: 10pt; }
          h4, h5, h6 { font-size: 11pt; margin-bottom: 8pt; }
          p, span, div { font-size: 10pt; line-height: 1.4; }
          .text-xs { font-size: 8pt; }
          .text-sm { font-size: 9pt; }
          .text-lg { font-size: 12pt; }

          /* Grid layout adjustment */
          .grid {
            page-break-inside: avoid;
            margin-bottom: 12pt;
          }

          /* Ensure content fits on page */
          .overflow-y-auto {
            overflow: visible !important;
            height: auto !important;
          }

          /* Print-friendly spacing */
          .px-6 { padding-left: 0; padding-right: 0; }
          .py-5 { padding-top: 0; padding-bottom: 8pt; }
          .space-y-4 > * + * { margin-top: 12pt; }

          /* Border styling for print */
          border {
            border-color: #000 !important;
          }

          /* Prevent color wash - use grays */
          .bg-slate-50,
          .dark\\:bg-slate-800\\/ 40 {
            background: #f5f5f5 !important;
          }

          /* Chart text - ensure visibility */
          .recharts-text,
          .recharts-legend-item-text,
          .recharts-cartesian-axis-tick {
            font-size: 8pt !important;
            fill: #000 !important;
          }

          /* Force single column on print for better fit */
          .sm\\:grid-cols-2 { grid-template-columns: 1fr !important; }
          .lg\\:grid-cols-3 { grid-template-columns: 1fr !important; }

          /* Last section - no break after */
          .rounded-2xl.border:last-of-type {
            page-break-after: avoid;
            margin-bottom: 0;
          }

          /* Remove bottom padding from last item */
          .flex-1.overflow-y-auto > div:last-child {
            margin-bottom: 0;
          }
        }

        /* Screen-only styles */
        @media screen {
          /* Ensure normal display on screen */
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN: WarehouseReportModal
// ═══════════════════════════════════════════════════════════

export default function WarehouseReportModal({
  open, generating, reportData, reportError,
  maintenanceSchedule = [],
  onGenerate, onClose, onRegenerate,
}: Props) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const showConfirm = !generating && !reportData && !reportError;
  const showLoading = generating;
  const showError   = !!reportError && !generating;
  const showReport  = !!reportData && !generating;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!generating ? onClose : undefined}
      />
      {/* Modal */}
      <div className="relative z-10 flex flex-col w-full max-w-5xl h-[92vh] rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {showConfirm && <ConfirmStep onGenerate={onGenerate} onClose={onClose} />}
        {showLoading && <LoadingStep />}
        {showError   && <ErrorStep error={reportError!} onRetry={onRegenerate} onClose={onClose} />}
        {showReport  && <ReportStep data={reportData!} onRegenerate={onRegenerate} onClose={onClose} maintenanceSchedule={maintenanceSchedule} />}
      </div>
    </div>
  );
}
