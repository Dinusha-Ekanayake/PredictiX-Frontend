"use client";

import * as React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  User,
  Building2,
  Calendar,
  CalendarClock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Pencil,
  Trash2,
  Bot,
  ClipboardList,
  Users,
  ShieldCheck,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Asset } from "./types";

/* ══════════════════════════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════════════════════════ */

const STATUS_META: Record<
  Asset["status"],
  { label: string; dot: string; bg: string }
> = {
  OPERATIONAL: {
    label: "Operational",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  },
  MAINTENANCE: {
    label: "Maintenance",
    dot: "bg-amber-500",
    bg: "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  },
  CRITICAL: {
    label: "Critical",
    dot: "bg-red-500",
    bg: "bg-red-50 text-red-700 ring-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  },
  OFFLINE: {
    label: "Offline",
    dot: "bg-slate-400",
    bg: "bg-slate-100 text-slate-500 ring-slate-200/60 dark:bg-white/[0.06] dark:text-slate-400 dark:ring-white/10",
  },
};

function StatusPill({ s }: { s: Asset["status"] }) {
  const m = STATUS_META[s];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset leading-none",
        m.bg,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", m.dot)} />
      {m.label}
    </span>
  );
}

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtCost(n: number) {
  return `$${n.toLocaleString()}`;
}

/* ── Health Ring (SVG) ─────────────────────────────────────────────────────── */
function HealthRing({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  const color =
    score >= 80
      ? "#10b981"
      : score >= 60
        ? "#84cc16"
        : score >= 40
          ? "#f59e0b"
          : score >= 20
            ? "#f97316"
            : "#ef4444";

  const label =
    score >= 80
      ? "Excellent"
      : score >= 60
        ? "Good"
        : score >= 40
          ? "Moderate"
          : score >= 20
            ? "Poor"
            : "Critical";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: 96, height: 96 }}>
        <svg width={96} height={96} viewBox="0 0 96 96">
          {/* Track */}
          <circle
            cx={48}
            cy={48}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={7}
            className="text-slate-200/60 dark:text-white/[0.08]"
          />
          {/* Glow */}
          <circle
            cx={48}
            cy={48}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
            style={{ filter: "drop-shadow(0 0 6px " + color + "40)" }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold leading-none tracking-tight">
            {score}
          </span>
          <span className="text-[10px] text-muted-foreground/60 mt-0.5">
            / 100
          </span>
        </div>
      </div>
      <span className="text-[11px] font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

/* ── Risk gauge ────────────────────────────────────────────────────────────── */
function RiskGauge({ probability }: { probability: number }) {
  const pct = Math.round(probability * 100);
  const color =
    pct >= 70
      ? "bg-red-500"
      : pct >= 40
        ? "bg-amber-500"
        : "bg-emerald-500";

  const glow =
    pct >= 70
      ? "shadow-[0_0_8px_rgba(239,68,68,0.3)]"
      : pct >= 40
        ? "shadow-[0_0_8px_rgba(245,158,11,0.3)]"
        : "";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Failure risk (8 weeks)</span>
        <span className="font-bold tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200/60 dark:bg-white/[0.08] overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            color,
            glow,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Info field ─────────────────────────────────────────────────────────────── */
function InfoField({
  icon,
  label,
  value,
  mono,
  valueClass,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] p-3 flex items-start gap-2.5 transition-colors">
      {icon && (
        <div className="mt-0.5 text-muted-foreground/60 shrink-0">{icon}</div>
      )}
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground/80 font-medium">
          {label}
        </div>
        <div
          className={cn(
            "text-sm font-medium mt-0.5 truncate",
            mono && "font-mono text-xs",
            valueClass,
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* ── Log / Event type pills ────────────────────────────────────────────────── */
const LOG_TYPE_META: Record<string, { label: string; cls: string }> = {
  PREVENTIVE: {
    label: "Preventive",
    cls: "bg-blue-50 text-blue-700 ring-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  },
  CORRECTIVE: {
    label: "Corrective",
    cls: "bg-red-50 text-red-700 ring-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  },
  INSPECTION: {
    label: "Inspection",
    cls: "bg-violet-50 text-violet-700 ring-violet-200/60 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20",
  },
};

const ACTION_META: Record<string, { label: string; cls: string }> = {
  ASSIGNED: {
    label: "Assigned",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  },
  UNASSIGNED: {
    label: "Unassigned",
    cls: "bg-slate-100 text-slate-600 ring-slate-200/60 dark:bg-white/[0.06] dark:text-slate-400 dark:ring-white/10",
  },
  REASSIGNED: {
    label: "Reassigned",
    cls: "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  },
};

function TypePill({
  type,
  meta,
}: {
  type: string;
  meta: Record<string, { label: string; cls: string }>;
}) {
  const m = meta[type] ?? { label: type, cls: "" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset leading-none",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/[0.08] p-8 text-center text-sm text-muted-foreground/60">
      {message}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════════════════════════ */
export default function AssetDetailsPanel({ asset }: { asset: Asset }) {
  const daysUntilMaint = asset.scheduledMaintenanceDate
    ? Math.ceil(
        (new Date(asset.scheduledMaintenanceDate).getTime() - Date.now()) /
          86_400_000,
      )
    : null;

  const predDiff =
    asset.scheduledMaintenanceDate && asset.predictedMaintenanceDate
      ? Math.ceil(
          (new Date(asset.predictedMaintenanceDate).getTime() -
            new Date(asset.scheduledMaintenanceDate).getTime()) /
            86_400_000,
        )
      : null;

  const CostDeltaIcon =
    asset.costVariance30d > 0.05
      ? TrendingUp
      : asset.costVariance30d < -0.05
        ? TrendingDown
        : Minus;

  const costDeltaColor =
    asset.costVariance30d > 0.05
      ? "text-red-500"
      : asset.costVariance30d < -0.05
        ? "text-emerald-500"
        : "text-muted-foreground";

  return (
    <div className="card-dynamic rounded-2xl border border-slate-200 dark:border-slate-700 bg-card overflow-hidden transition-all">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-50/40 dark:bg-white/[0.02]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold truncate">{asset.name}</h2>
            <StatusPill s={asset.status} />
            <span className="text-[11px] font-mono text-muted-foreground/70 bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
              {asset.id}
            </span>
          </div>
          <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
            {asset.description}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-xl gap-1.5 text-xs border-slate-200 dark:border-slate-700"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 rounded-xl gap-1.5 text-xs"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>

      {/* ── AI Metrics strip ── */}
      <div className="px-5 py-5 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Health ring */}
          <HealthRing score={asset.healthScore} />

          {/* Vertical divider */}
          <div className="hidden sm:block h-24 w-px bg-slate-200/80 dark:bg-white/[0.06]" />

          {/* Right-side metrics */}
          <div className="flex-1 space-y-3.5 w-full">
            <RiskGauge probability={asset.failureProbability8w} />

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                Model confidence
              </span>
              <span className="font-bold tabular-nums">
                {Math.round(asset.predictionConfidence * 100)}%
              </span>
            </div>

            {/* AI maintenance gap callout */}
            {predDiff !== null && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium",
                  predDiff < 0
                    ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    : predDiff > 0
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
                )}
              >
                {predDiff < 0 ? (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Zap className="h-3.5 w-3.5 shrink-0" />
                )}
                {predDiff < 0
                  ? `AI predicts failure ${Math.abs(predDiff)} days before scheduled maintenance`
                  : predDiff > 0
                    ? `Asset may last ${predDiff} days beyond scheduled maintenance`
                    : "AI prediction aligns with schedule"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Fields grid ── */}
      <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <InfoField
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="Warehouse"
            value={asset.warehouse.name}
          />
          <InfoField
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Location"
            value={asset.location}
          />
          <InfoField
            icon={<User className="h-3.5 w-3.5" />}
            label="Assigned To"
            value={asset.assignedPerson?.name ?? "Unassigned"}
          />
          <InfoField
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Last Maintenance"
            value={fmt(asset.lastMaintenanceDate)}
          />
          <InfoField
            icon={<CalendarClock className="h-3.5 w-3.5" />}
            label="Scheduled Maintenance"
            value={
              asset.scheduledMaintenanceDate
                ? `${fmt(asset.scheduledMaintenanceDate)}${
                    daysUntilMaint !== null
                      ? ` (${
                          daysUntilMaint > 0
                            ? `in ${daysUntilMaint}d`
                            : `${Math.abs(daysUntilMaint)}d ago`
                        })`
                      : ""
                  }`
                : "—"
            }
          />
          <InfoField
            icon={<Bot className="h-3.5 w-3.5" />}
            label="AI-Predicted Maintenance"
            value={fmt(asset.predictedMaintenanceDate)}
          />
          <InfoField
            icon={<DollarSign className="h-3.5 w-3.5" />}
            label="Estimated Cost"
            value={fmtCost(asset.estimatedCost)}
          />
          {/* Cost variance — custom to show colour */}
          <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] p-3 flex items-start gap-2.5 transition-colors">
            <div className={cn("mt-0.5 shrink-0", costDeltaColor)}>
              <CostDeltaIcon className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground/80 font-medium">
                Cost Variance (30d)
              </div>
              <div className={cn("text-sm font-semibold mt-0.5", costDeltaColor)}>
                {asset.costVariance30d >= 0 ? "+" : ""}
                {Math.round(asset.costVariance30d * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="px-5 pb-5 pt-4">
        <Tabs defaultValue="insights">
          <TabsList className="rounded-xl w-full justify-start overflow-x-auto bg-slate-100/60 dark:bg-white/[0.04]">
            <TabsTrigger
              value="insights"
              className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08]"
            >
              <Bot className="h-3.5 w-3.5" />
              Predictive Insights
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08]"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Maintenance Logs
              {asset.maintenanceLogs.length > 0 && (
                <span className="ml-1 rounded-full bg-slate-200/60 dark:bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-semibold">
                  {asset.maintenanceLogs.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08]"
            >
              <Users className="h-3.5 w-3.5" />
              Assignments
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          {/* ═══ Insights ═══ */}
          <TabsContent value="insights" className="mt-4 space-y-3">
            {/* Placeholder charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className="rounded-xl border border-dashed border-slate-200 dark:border-white/[0.08] bg-slate-50/30 dark:bg-white/[0.02] p-4 flex flex-col items-center justify-center gap-2"
                style={{ height: 180 }}
              >
                <Bot className="h-7 w-7 text-muted-foreground/20" />
                <div className="text-xs text-muted-foreground/60 text-center">
                  Health Score Trend & Forecast
                  <br />
                  <span className="text-[10px] opacity-70">
                    (XGBoost prediction — coming soon)
                  </span>
                </div>
              </div>
              <div
                className="rounded-xl border border-dashed border-slate-200 dark:border-white/[0.08] bg-slate-50/30 dark:bg-white/[0.02] p-4 flex flex-col items-center justify-center gap-2"
                style={{ height: 180 }}
              >
                <Bot className="h-7 w-7 text-muted-foreground/20" />
                <div className="text-xs text-muted-foreground/60 text-center">
                  Failure Probability (8-week)
                  <br />
                  <span className="text-[10px] opacity-70">
                    (XGBoost prediction — coming soon)
                  </span>
                </div>
              </div>
            </div>

            {/* Insight bullets — dynamically generated */}
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/30 dark:bg-white/[0.02] p-4 space-y-3">
              <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                AI Insight Summary
              </div>
              <div className="space-y-2.5">
                {predDiff !== null && predDiff < 0 && (
                  <div className="flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>
                      AI predicts maintenance is needed{" "}
                      <strong>{Math.abs(predDiff)} days earlier</strong> than
                      currently scheduled.
                    </span>
                  </div>
                )}
                {asset.failureProbability8w > 0.6 && (
                  <div className="flex items-start gap-2.5 text-sm text-amber-600 dark:text-amber-400">
                    <Zap className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>
                      High failure probability (
                      {Math.round(asset.failureProbability8w * 100)}%) —
                      consider immediate inspection.
                    </span>
                  </div>
                )}
                {asset.costVariance30d > 0.1 && (
                  <div className="flex items-start gap-2.5 text-sm text-orange-600 dark:text-orange-400">
                    <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>
                      Maintenance costs running{" "}
                      {Math.round(asset.costVariance30d * 100)}% above
                      baseline.
                    </span>
                  </div>
                )}
                {asset.healthScore >= 80 && (
                  <div className="flex items-start gap-2.5 text-sm text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>
                      Asset health is excellent. No immediate action required.
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2.5 text-sm text-muted-foreground/70">
                  <Bot className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    Model confidence at{" "}
                    {Math.round(asset.predictionConfidence * 100)}% — based on
                    available sensor and maintenance log data.
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══ Maintenance Logs ═══ */}
          <TabsContent value="history" className="mt-4 space-y-3">
            {asset.maintenanceLogs.length === 0 ? (
              <EmptyState message="No maintenance logs available for this asset." />
            ) : (
              asset.maintenanceLogs.map((l) => (
                <div
                  key={l.id}
                  className="ticket-dynamic rounded-xl border border-slate-200/80 dark:border-white/[0.06] p-4 space-y-2 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <TypePill type={l.type} meta={LOG_TYPE_META} />
                      <div className="text-[11px] text-muted-foreground/70">
                        {fmt(l.date)} · Performed by{" "}
                        <span className="font-medium text-foreground/80">
                          {l.performedBy?.name ?? "—"}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold shrink-0 tabular-nums">
                      {fmtCost(l.cost)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground/80 leading-relaxed">
                    {l.notes}
                  </p>
                </div>
              ))
            )}
          </TabsContent>

          {/* ═══ Assignments ═══ */}
          <TabsContent value="assignments" className="mt-4 space-y-3">
            {asset.assignmentHistory.length === 0 ? (
              <EmptyState message="No assignment history for this asset." />
            ) : (
              asset.assignmentHistory.map((e) => (
                <div
                  key={e.id}
                  className="ticket-dynamic rounded-xl border border-slate-200/80 dark:border-white/[0.06] p-4 transition-all"
                >
                  <TypePill type={e.action} meta={ACTION_META} />
                  <div className="mt-1.5 text-sm font-medium">
                    {e.user?.name ?? "—"}
                  </div>
                  <div className="text-[11px] text-muted-foreground/70 mt-0.5">
                    {fmt(e.date)} · by{" "}
                    <span className="font-medium text-foreground/80">
                      {e.byAdmin?.name ?? "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* ═══ Audit Trail ═══ */}
          <TabsContent value="audit" className="mt-4 space-y-3">
            {asset.auditTrail.length === 0 ? (
              <EmptyState message="No audit events recorded for this asset." />
            ) : (
              asset.auditTrail.map((a) => (
                <div
                  key={a.id}
                  className="ticket-dynamic rounded-xl border border-slate-200/80 dark:border-white/[0.06] p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground/70">
                        Field:{" "}
                        <span className="font-semibold text-foreground/90 font-mono">
                          {a.field}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground/60 mt-0.5">
                        {fmt(a.date)} · by{" "}
                        <span className="font-medium text-foreground/80">
                          {a.by?.name ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="line-through text-muted-foreground/50">
                      {a.oldValue}
                    </span>
                    <span className="text-muted-foreground/40">→</span>
                    <span className="font-semibold">{a.newValue}</span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}