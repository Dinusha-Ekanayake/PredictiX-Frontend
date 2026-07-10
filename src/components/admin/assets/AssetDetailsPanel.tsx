"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, User, Building2, Calendar, CalendarClock,
  TrendingUp, TrendingDown, Minus, Pencil, Trash2, Bot,
  ClipboardList, Users, ShieldCheck, Zap, AlertTriangle,
  RefreshCw, Ticket, ChevronRight, Loader2,
  Info, Gauge, Hash, Wrench, FileText,
} from "lucide-react";
import { toast } from "@/lib/customToast";
import { cn } from "@/lib/utils";
import { useNavRouter } from "@/components/navigation/useNavRouter";
import type { AssetDetail, ComponentRulOut, PredictionTier } from "./types";
// CHANGE 1: removed generateAssetReport from import — report now handled by parent via onReport prop
import { deriveHealthScore, deriveFailureProbability, runVehiclePrediction } from "./assetService";
import LogMaintenanceDialog from "./LogMaintenanceDialog";
import SendServiceReminderButton from "./SendServiceReminderButton";
/* ══════════════════════════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════════════════════════ */

function fmt(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtCost(n: number | null | undefined, currency = "LKR"): string {
  if (n == null) return "—";
  return `${currency} ${Number(n).toLocaleString()}`;
}

/* ── Status pill ─────────────────────────────────────────────────────────────── */
const STATUS_BG: Record<string, string> = {
  active:       "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  maintenance:  "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  in_maintenance:"bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  inactive:     "bg-slate-100 text-slate-500 ring-slate-200/60 dark:bg-white/6 dark:text-slate-400 dark:ring-white/10",
  retired:      "bg-slate-100 text-slate-500 ring-slate-200/60 dark:bg-white/6 dark:text-slate-400 dark:ring-white/10",
};
const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-500", maintenance: "bg-amber-500",
  in_maintenance: "bg-amber-500", inactive: "bg-slate-400", retired: "bg-slate-400",
};

function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase();
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset leading-none",
      STATUS_BG[key] ?? "bg-muted text-muted-foreground ring-border",
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[key] ?? "bg-slate-400")} />
      {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
    </span>
  );
}

/* ── Health Ring ─────────────────────────────────────────────────────────────── */
function HealthRing({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#84cc16" : score >= 40 ? "#f59e0b" : score >= 20 ? "#f97316" : "#ef4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Moderate" : score >= 20 ? "Poor" : "Critical";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: 96, height: 96 }}>
        <svg width={96} height={96} viewBox="0 0 96 96">
          <circle cx={48} cy={48} r={r} fill="none" stroke="currentColor" strokeWidth={7}
            className="text-slate-200/60 dark:text-white/8" />
          <circle cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={7}
            strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
            transform="rotate(-90 48 48)"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold leading-none">{score}</span>
          <span className="text-[10px] text-muted-foreground/60 mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="text-[11px] font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

/* ── Risk gauge ──────────────────────────────────────────────────────────────── */
function RiskGauge({ probability }: { probability: number }) {
  const pct = Math.round(probability * 100);
  const color = pct >= 70 ? "bg-red-500" : pct >= 40 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Failure risk (8 weeks)</span>
        <span className="font-bold tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200/60 dark:bg-white/8 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── Info field ──────────────────────────────────────────────────────────────── */
function InfoField({ icon, label, value, mono, valueClass, action }: {
  icon?: React.ReactNode; label: string; value: string; mono?: boolean; valueClass?: string; action?: React.ReactNode;
}) {
  return (
    <div className="h-full rounded-xl border border-slate-200/80 dark:border-white/6 bg-slate-50/50 dark:bg-white/2 p-3 flex items-start gap-2.5">
      {icon && <div className="mt-0.5 text-muted-foreground/60 shrink-0">{icon}</div>}
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-muted-foreground/80 font-medium">{label}</div>
        <div className={cn("text-sm font-medium mt-0.5 leading-snug break-words", mono && "font-mono text-xs", valueClass)}>
          {value}
        </div>
      </div>
      {action && <div className="ml-auto -mr-1 -mt-1 shrink-0">{action}</div>}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────────── */
function EmptyState({ message, icon: Icon = Info }: { message: string, icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 dark:border-white/8 bg-slate-50/30 dark:bg-white/2 p-8 text-center">
      <div className="rounded-full bg-slate-100 dark:bg-white/5 p-3">
        <Icon className="h-5 w-5 text-muted-foreground/40" />
      </div>
      <p className="text-sm font-medium text-muted-foreground/70">{message}</p>
    </div>
  );
}

/* ── Ticket priority pill ────────────────────────────────────────────────────── */
const PRIORITY_META: Record<string, string> = {
  critical: "bg-red-50 text-red-700 ring-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  high:     "bg-orange-50 text-orange-700 ring-orange-200/60 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20",
  medium:   "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  low:      "bg-blue-50 text-blue-700 ring-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
};

function PriorityPill({ priority }: { priority: string | null }) {
  if (!priority) return <span className="text-xs text-muted-foreground/50">—</span>;
  const key = priority.toLowerCase();
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
      PRIORITY_META[key] ?? "bg-muted text-muted-foreground ring-border",
    )}>
      {priority}
    </span>
  );
}

/* ── Prediction tier badge ───────────────────────────────────────────────────────
   Surfaces the decision layer's reconciled recommendation (classifier +
   regressor + health score) instead of showing a raw date regardless of
   whether the classifier thinks action is actually needed. */
const TIER_META: Record<PredictionTier, { label: string; className: string }> = {
  urgent: {
    label: "Urgent",
    className: "bg-red-50 text-red-700 ring-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  },
  watch: {
    label: "Watch",
    className: "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  },
  healthy: {
    label: "Healthy",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  },
  conflict: {
    label: "Needs Review",
    className: "bg-violet-50 text-violet-700 ring-violet-200/60 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20",
  },
};

function TierBadge({ tier }: { tier: PredictionTier | null | undefined }) {
  if (!tier || !TIER_META[tier]) return null;
  const meta = TIER_META[tier];
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
      meta.className,
    )}>
      {meta.label}
    </span>
  );
}

/* ── Ticket status pill ───────────────────────────────────────────────────────── */
const TICKET_STATUS_META: Record<string, string> = {
  open:        "bg-blue-50 text-blue-700 ring-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  in_progress: "bg-violet-50 text-violet-700 ring-violet-200/60 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20",
  resolved:    "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  closed:      "bg-slate-100 text-slate-500 ring-slate-200/60 dark:bg-white/6 dark:text-slate-400 dark:ring-white/10",
};

function TicketStatusPill({ status }: { status: string }) {
  const key = status.toLowerCase();
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
      TICKET_STATUS_META[key] ?? "bg-muted text-muted-foreground ring-border",
    )}>
      {status.replace("_", " ")}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Loading skeleton
   ══════════════════════════════════════════════════════════════════════════════ */
export function AssetDetailsSkeleton() {
  return (
    <div className="card-dynamic rounded-2xl border border-slate-200 dark:border-slate-700 bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-3.5 w-80 rounded" />
        </div>
      </div>
      <div className="px-5 py-5 border-b border-slate-200/80 dark:border-white/6">
        <div className="flex gap-6">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
            <Skeleton className="h-8 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════════════════════════ */
type Props = {
  detail: AssetDetail;
  onRefresh: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (asset: AssetDetail["asset"]) => void;
  onReport?: () => void; // CHANGE 2: added onReport prop — opens shared AssetReportModal in page.tsx
  readOnly?: boolean;
};

export default function AssetDetailsPanel({ detail, onRefresh, onDelete, onEdit, onReport, readOnly = false }: Props) {
  const { asset, prediction, componentRul, maintenanceEvents, tickets, assignments } = detail;
  const router = useNavRouter();

  const [runningPrediction, setRunningPrediction] = React.useState(false);
  const [showLogMaintenance, setShowLogMaintenance] = React.useState(false);
  // CHANGE 3: removed generatingReport state — no longer needed

  const healthScore = deriveHealthScore(asset, prediction);
  const failureProb = deriveFailureProbability(prediction);

  // Hard dates are only actionable when the decision layer's tier agrees
  // action is near-term (urgent/watch/conflict); "healthy" demotes the
  // regressor's date to a soft horizon instead of showing a specific date
  // for an asset the classifier says doesn't need service.
  const showHardDate = prediction?.display_mode === "date";

  const daysUntilMaint = asset.next_service_date
    ? Math.ceil((new Date(asset.next_service_date).getTime() - Date.now()) / 86_400_000)
    : null;

  const aiDaysUntilMaint = prediction?.predicted_maintenance_date
    ? Math.ceil((new Date(prediction.predicted_maintenance_date).getTime() - Date.now()) / 86_400_000)
    : null;

  const predDiff =
    asset.next_service_date && prediction?.predicted_maintenance_date
      ? Math.ceil(
          (new Date(prediction.predicted_maintenance_date).getTime() -
            new Date(asset.next_service_date).getTime()) / 86_400_000,
        )
      : null;

  const costVariance =
    prediction?.estimated_cost_lkr && prediction?.min_cost_lkr
      ? (Number(prediction.estimated_cost_lkr) - Number(prediction.min_cost_lkr)) /
        (Number(prediction.min_cost_lkr) || 1)
      : 0;

  const CostDeltaIcon =
    costVariance > 0.05 ? TrendingUp : costVariance < -0.05 ? TrendingDown : Minus;
  const costDeltaColor =
    costVariance > 0.05 ? "text-red-500" : costVariance < -0.05 ? "text-emerald-500" : "text-muted-foreground";

  async function handleRunPrediction() {
    setRunningPrediction(true);
    try {
      await runVehiclePrediction(asset.id);
      toast.success("Prediction generated successfully!");
      onRefresh();
    } catch (e: any) {
      console.warn("Prediction failed:", e);
      const msg = e.message || "Failed to generate prediction";
      const isNoSensor = msg.toLowerCase().includes("no sensor reading");
      toast.error(isNoSensor ? "No sensor data available for this asset. Please ensure sensor readings are recorded before running a prediction." : msg);
    } finally {
      setRunningPrediction(false);
    }
  }

  // CHANGE 4: removed handleGenerateReport — Report button now calls onReport() directly

  function goToTicket(ticketId: string) {
    router.push(`/admin/tickets?ticket_id=${ticketId}`);
  }

  return (
    <div className="card-dynamic rounded-2xl border border-slate-200 dark:border-slate-700 bg-card overflow-hidden transition-all">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200/80 dark:border-white/6 bg-slate-50/40 dark:bg-white/2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold truncate">{asset.asset_name}</h2>
            <StatusPill status={asset.status} />
            <span className="text-[11px] font-mono text-muted-foreground/70 bg-slate-100 dark:bg-white/6 px-2 py-0.5 rounded-full">
              {asset.asset_code}
            </span>
            {asset.registration_number && (
              <span className="text-[11px] font-mono text-muted-foreground/60 bg-slate-100 dark:bg-white/6 px-2 py-0.5 rounded-full">
                {asset.registration_number}
              </span>
            )}
          </div>
          {asset.description && (
            <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
              {asset.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!readOnly && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl gap-1.5 text-xs border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                onClick={() => setShowLogMaintenance(true)}
              >
                <Wrench className="h-3 w-3" />
                Log Maint.
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl gap-1.5 text-xs border-slate-200 dark:border-slate-700"
                onClick={handleRunPrediction}
                disabled={runningPrediction}
              >
                {runningPrediction
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <RefreshCw className="h-3 w-3" />}
                {runningPrediction ? "Running…" : "Run AI"}
              </Button>
              {/* CHANGE 5: Report button now calls onReport() — opens shared modal in page.tsx */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl gap-1.5 text-xs border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                onClick={onReport}
              >
                <FileText className="h-3 w-3" />
                Report
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl gap-1.5 text-xs border-slate-200 dark:border-slate-700"
                  onClick={() => onEdit(asset)}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 rounded-xl gap-1.5 text-xs"
                  onClick={() => onDelete(asset.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── AI Metrics strip ── */}
      <div className="px-5 py-5 border-b border-slate-200/80 dark:border-white/6">
        {prediction ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <HealthRing score={healthScore} />
            <div className="hidden sm:block h-24 w-px bg-slate-200/80 dark:bg-white/6" />
            <div className="flex-1 space-y-3.5 w-full">
              <div className="flex items-center gap-2">
                <TierBadge tier={prediction.tier} />
                {prediction.agreement === false && (
                  <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Signals disagree
                  </span>
                )}
              </div>
              <RiskGauge probability={failureProb} />
              {predDiff !== null && showHardDate && (
                <div className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium",
                  predDiff < 0
                    ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    : predDiff > 0
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
                )}>
                  {predDiff < 0
                    ? <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    : <Zap className="h-3.5 w-3.5 shrink-0" />}
                  {predDiff < 0
                    ? `AI predicts failure ${Math.abs(predDiff)} days before scheduled service`
                    : predDiff > 0
                      ? `Asset may last ${predDiff} days beyond scheduled service`
                      : "AI prediction aligns with schedule"}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-slate-200 dark:border-white/8 p-4">
            <Bot className="h-8 w-8 text-muted-foreground/20 shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground/70">No prediction data yet.</p>
              <p className="text-[12px] text-muted-foreground/50 mt-0.5">
                Click <strong>Run AI</strong> to generate a prediction for this asset.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Image Gallery ── */}
      {(() => {
        const existing = asset?.meta?.images || [];
        const legacy = asset?.meta?.image_url;
        let allImages = [...existing];
        if (legacy && !allImages.includes(legacy)) {
          allImages.unshift(legacy);
        }
        if (allImages.length === 0) return null;
        return (
          <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/6 bg-slate-50/20 dark:bg-slate-900/10">
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Asset Images</h3>
            <div className="flex flex-wrap gap-3">
              {allImages.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-black group">
                  <Image src={url} alt={`Asset image ${idx}`} width={128} height={128} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Fields grid ── */}
      <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <InfoField
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="Warehouse ID"
            value={asset.warehouse_id}
            mono
          />
          <InfoField
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Vehicle Type"
            value={[asset.vehicle_type, asset.asset_type].filter(Boolean).join(" · ") || "—"}
          />
          <InfoField
            icon={<User className="h-3.5 w-3.5" />}
            label="Assigned To"
            value={asset.assigned_to ?? "Unassigned"}
            mono={!!asset.assigned_to}
          />
          <InfoField
            icon={<Gauge className="h-3.5 w-3.5" />}
            label="Make / Model"
            value={[asset.make, asset.model, asset.manufacture_year].filter(Boolean).join(" ") || "—"}
          />
          <InfoField
            icon={<Hash className="h-3.5 w-3.5" />}
            label="VIN"
            value={asset.vin ?? "—"}
            mono
          />
          <InfoField
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Last Service"
            value={fmt(asset.last_service_date)}
          />
          <InfoField
            icon={<CalendarClock className="h-3.5 w-3.5" />}
            label="Next Scheduled Service"
            value={
              asset.status === "under_maintenance"
                ? "Currently in Maintenance"
                : asset.next_service_date
                  ? `${fmt(asset.next_service_date)}${daysUntilMaint !== null ? ` (${daysUntilMaint > 0 ? `in ${daysUntilMaint}d` : `${Math.abs(daysUntilMaint)}d overdue`})` : ""}`
                  : "—"
            }
            valueClass={asset.status !== "under_maintenance" && daysUntilMaint !== null && daysUntilMaint < 0 ? "text-red-500 dark:text-red-400" : undefined}
            action={
              <SendServiceReminderButton
                assetId={asset.id}
                assetName={asset.asset_name}
                hasAssignee={!!asset.assigned_to}
                hasServiceDate={!!asset.next_service_date}
              />
            }
          />
          <InfoField
            icon={<Bot className="h-3.5 w-3.5" />}
            label="AI-Predicted Maintenance"
            value={
              showHardDate
                ? fmt(prediction?.predicted_maintenance_date)
                : prediction?.horizon_text ?? fmt(prediction?.predicted_maintenance_date)
            }
          />
          {/* Cost prediction */}
          <div className="h-full rounded-xl border border-slate-200/80 dark:border-white/6 bg-slate-50/50 dark:bg-white/2 p-3 flex items-start gap-2.5">
            <div className={cn("mt-0.5 shrink-0", costDeltaColor)}>
              <CostDeltaIcon className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground/80 font-medium">Est. Maintenance Cost</div>
              <div className="text-sm font-semibold mt-0.5">
                {fmtCost(prediction?.estimated_cost_lkr)}
              </div>
              {prediction && (
                <div className="text-[11px] text-muted-foreground/60 mt-0.5">
                  Range: {fmtCost(prediction.min_cost_lkr)} – {fmtCost(prediction.max_cost_lkr)}
                </div>
              )}
            </div>
          </div>
          <InfoField
            icon={<Info className="h-3.5 w-3.5" />}
            label="Odometer"
            value={asset.current_mileage != null ? `${Number(asset.current_mileage).toLocaleString()} km` : "—"}
          />
          <InfoField
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            label="Warranty Expiry"
            value={fmt(asset.warranty_expiry_date)}
          />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="px-5 pb-5 pt-4">
        <Tabs defaultValue="insights">
          <TabsList className="rounded-xl w-full justify-start overflow-x-auto bg-slate-100/60 dark:bg-white/4">
            {[
              { value: "insights", icon: Bot, label: "Predictive Insights" },
              { value: "tickets", icon: Ticket, label: "Tickets", count: tickets.length },
              { value: "maintenance", icon: ClipboardList, label: "Maintenance Logs", count: maintenanceEvents.length },
              { value: "assignments", icon: Users, label: "Assignments", count: assignments.length },
            ].map(({ value, icon: Icon, label, count }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/8"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {count !== undefined && count > 0 && (
                  <span className="ml-1 rounded-full bg-slate-200/60 dark:bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ═══ Insights ═══ */}
          <TabsContent value="insights" className="mt-4 space-y-4">
            {!prediction ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/8 bg-slate-50/30 dark:bg-white/2 p-10 text-center">
                <div className="rounded-full bg-primary/8 dark:bg-white/6 p-4">
                  <Bot className="h-8 w-8 text-primary/50 dark:text-white/30" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground/80">No prediction data yet</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Click <strong>Run AI</strong> to generate health, risk, and cost predictions for this asset.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 rounded-xl px-4"
                  onClick={handleRunPrediction}
                  disabled={runningPrediction}
                >
                  {runningPrediction ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  {runningPrediction ? "Running…" : "Run AI Now"}
                </Button>
              </div>
            ) : (
              <>
                {/* ── Row 1: Health score + Failure probability gauges ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Health Score Card */}
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/6 bg-slate-50/30 dark:bg-white/2 p-4 space-y-3">
                    <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Health Score</div>
                    <div className="flex items-center gap-4">
                      <HealthRing score={healthScore} />
                      <div className="flex-1 space-y-1.5">
                        {[
                          { label: "Brake", key: "brake" },
                          { label: "Tire", key: "tire" },
                          { label: "Battery", key: "battery" },
                          { label: "Oil", key: "oil" },
                          { label: "Hydraulic", key: "hydraulic" },
                        ].map(({ label, key }) => {
                          const comp = componentRul?.components.find((c) => c.component === key);
                          const pct = comp?.current_health_pct != null
                            ? Math.min(100, Math.max(0, Math.round(comp.current_health_pct)))
                            : null;
                          const color = pct == null ? "bg-slate-200 dark:bg-white/10" : pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
                          return (
                            <div key={key} className="space-y-0.5">
                              <div className="flex justify-between text-[10px] text-muted-foreground/70">
                                <span>{label}</span>
                                <span className="tabular-nums font-medium">{pct != null ? `${pct}%` : "—"}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-200/60 dark:bg-white/8 overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: pct != null ? `${pct}%` : "30%" }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Failure Probability Card */}
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/6 bg-slate-50/30 dark:bg-white/2 p-4 space-y-3">
                    <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Failure Risk Profile</div>
                    <div className="space-y-3">
                      <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                        failureProb >= 0.7
                          ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                          : failureProb >= 0.4
                          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      }`}>
                        <div>
                          <div className="text-xs font-medium opacity-80">Failure Probability</div>
                          <div className="text-2xl font-bold tabular-nums">{Math.round(failureProb * 100)}%</div>
                        </div>
                        <div className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${
                          failureProb >= 0.7 ? "ring-red-200/60 dark:ring-red-500/30 bg-red-100/60 dark:bg-red-500/20"
                          : failureProb >= 0.4 ? "ring-amber-200/60 dark:ring-amber-500/30 bg-amber-100/60 dark:bg-amber-500/20"
                          : "ring-emerald-200/60 dark:ring-emerald-500/30 bg-emerald-100/60 dark:bg-emerald-500/20"
                        }`}>
                          {prediction.risk_level?.toUpperCase() ?? "UNKNOWN"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground/60">
                          <span>Low risk</span><span>High risk</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-200/60 dark:bg-white/8 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${failureProb >= 0.7 ? "bg-red-500" : failureProb >= 0.4 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.round(failureProb * 100)}%` }}
                          />
                        </div>
                      </div>
                      {showHardDate && aiDaysUntilMaint != null ? (
                        <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-white/6 pt-2">
                          <span className="text-muted-foreground">Days until maintenance</span>
                          <span className={`font-bold tabular-nums ${aiDaysUntilMaint < 0 ? "text-red-600 dark:text-red-400" : aiDaysUntilMaint <= 14 ? "text-red-500" : aiDaysUntilMaint <= 30 ? "text-amber-500" : "text-foreground"}`}>
                            {aiDaysUntilMaint < 0 ? `${Math.abs(aiDaysUntilMaint)}d overdue` : `${aiDaysUntilMaint}d`}
                          </span>
                        </div>
                      ) : prediction.horizon_text ? (
                        <div className="text-xs text-muted-foreground border-t border-slate-200/60 dark:border-white/6 pt-2">
                          {prediction.horizon_text}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* ── Row 2: SHAP Top Feature Importance ──
                     SHAP impact is signed in days against the regressor's
                     predicted_days_until_maintenance: negative pulls the date
                     closer (more urgent), positive pushes it further out
                     (less urgent). Colored + directional so that reads at a
                     glance instead of requiring the reader to parse a sign. */}
                {(() => {
                  const topFactors = prediction?.top_explanations ?? [];
                  if (topFactors.length === 0) return null;
                  const maxVal = Math.max(...topFactors.map((f) => Math.abs(f.impact ?? 0)), 1);
                  return (
                    <div className="rounded-xl border border-slate-200/80 dark:border-white/6 bg-slate-50/30 dark:bg-white/2 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Top Risk Factors (SHAP)</div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
                          <span className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3 text-red-500" /> Sooner
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-emerald-500" /> Later
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {topFactors.map((f, i) => {
                          const raw = f.impact ?? 0;
                          const impact = Math.abs(raw);
                          const pct = Math.round((impact / maxVal) * 100);
                          const label = f.feature.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                          const isUrgent = raw < 0;
                          const barColor = isUrgent ? "bg-red-500/80" : "bg-emerald-500/80";
                          const textColor = isUrgent ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400";
                          const DirIcon = isUrgent ? TrendingDown : TrendingUp;
                          return (
                            <div key={i} className="space-y-0.5">
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-muted-foreground font-medium truncate">{label}</span>
                                <span className={cn("flex items-center gap-1 text-xs font-mono shrink-0 ml-2", textColor)}>
                                  <DirIcon className="h-3 w-3" />
                                  {f.impact != null ? `${raw > 0 ? "+" : ""}${raw.toFixed(2)}d` : "—"}
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-200/60 dark:bg-white/8 overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all duration-700", barColor)} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* ── Row 3: AI Insight bullets + Cost card ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/6 bg-slate-50/30 dark:bg-white/2 p-4 space-y-3">
                    <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">AI Recommendations</div>
                    <div className="space-y-2.5">
                      {prediction.tier === "conflict" && (
                        <div className="flex items-start gap-2.5 text-sm text-violet-600 dark:text-violet-400">
                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>Classifier and health score disagree — <strong>flagged for manual review</strong>.</span>
                        </div>
                      )}
                      {showHardDate && predDiff !== null && predDiff < 0 && (
                        <div className="flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>AI predicts failure <strong>{Math.abs(predDiff)} days earlier</strong> than scheduled service.</span>
                        </div>
                      )}
                      {showHardDate && predDiff !== null && predDiff > 0 && (
                        <div className="flex items-start gap-2.5 text-sm text-amber-600 dark:text-amber-400">
                          <Zap className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>Asset may last <strong>{predDiff} more days</strong> beyond scheduled service.</span>
                        </div>
                      )}
                      {failureProb >= 0.7 && (
                        <div className="flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>Very high failure risk — <strong>schedule immediate inspection</strong>.</span>
                        </div>
                      )}
                      {failureProb >= 0.4 && failureProb < 0.7 && (
                        <div className="flex items-start gap-2.5 text-sm text-amber-600 dark:text-amber-400">
                          <Zap className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>Elevated failure risk — <strong>inspect within the next 2 weeks</strong>.</span>
                        </div>
                      )}
                      {prediction.tier === "healthy" && (
                        <div className="flex items-start gap-2.5 text-sm text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>Asset health is good — no immediate action required.</span>
                        </div>
                      )}
                      {asset.lifetime_breakdown_count != null && asset.lifetime_breakdown_count > 0 && (
                        <div className="flex items-start gap-2.5 text-sm text-muted-foreground/70">
                          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>Lifetime breakdowns: <strong>{asset.lifetime_breakdown_count}</strong> · Services: <strong>{asset.lifetime_service_count ?? "—"}</strong></span>
                        </div>
                      )}
                      <div className="flex items-start gap-2.5 text-sm text-muted-foreground/70">
                        <Bot className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        {showHardDate ? (
                          <span>
                            {aiDaysUntilMaint !== null && aiDaysUntilMaint < 0 ? "Maintenance was due on:" : "Predicted maintenance date:"}
                            <strong> {prediction.predicted_maintenance_date ? new Date(prediction.predicted_maintenance_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</strong>
                          </span>
                        ) : (
                          <span>{prediction.horizon_text ?? prediction.recommended_action ?? "—"}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {(prediction.estimated_cost_lkr != null) && (
                    <div className="rounded-xl border border-slate-200/80 dark:border-white/6 bg-slate-50/30 dark:bg-white/2 p-4 space-y-3">
                      <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Maintenance Cost Estimate</div>
                      <div className="space-y-3">
                        <div className="text-3xl font-bold tabular-nums">
                          {fmtCost(prediction.estimated_cost_lkr)}
                        </div>
                        <div className="space-y-2">
                          {[
                            { label: "Minimum", value: prediction.min_cost_lkr, color: "bg-emerald-500" },
                            { label: "Estimated", value: prediction.estimated_cost_lkr, color: "bg-violet-500" },
                            { label: "Maximum", value: prediction.max_cost_lkr, color: "bg-red-500" },
                          ].map(({ label, value, color }) => {
                            const max = Number(prediction.max_cost_lkr) || 1;
                            const pct = Math.min(100, Math.round((Number(value) / max) * 100));
                            return (
                              <div key={label} className="space-y-0.5">
                                <div className="flex justify-between text-[11px] text-muted-foreground/70">
                                  <span>{label}</span>
                                  <span className="font-mono font-medium">{fmtCost(value)}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-200/60 dark:bg-white/8 overflow-hidden">
                                  <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Row 4: Component RUL (this asset's own sensor history trend,
                     cross-checked against the v7 regressor's whole-asset
                     prediction — see ComponentRulOut.model_corroborated /
                     disagrees_with_model / horizon_capped) ── */}
                {componentRul && (
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/6 bg-slate-50/30 dark:bg-white/2 p-4 space-y-4 mt-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                        Component Remaining Useful Life (RUL)
                      </div>
                      <span
                        className="text-[10px] text-muted-foreground/50 cursor-help"
                        title="Estimated from this asset's own last 4 sensor readings per component — directional, not precise. Cross-checked against the AI model's overall maintenance prediction."
                      >
                        What is this?
                      </span>
                    </div>
                    {componentRul.components.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No component health data available.</div>
                    ) : (
                      <div className="space-y-4">
                        {componentRul.components.map((comp: ComponentRulOut, i) => {
                          if (comp.confidence === "no_data" || comp.current_health_pct == null) {
                            return (
                              <div key={i} className="flex justify-between items-center text-[11px] text-muted-foreground/60">
                                <span className="capitalize">{comp.component}</span>
                                <span>No sensor history</span>
                              </div>
                            );
                          }

                          const isCritical = comp.rul_days != null && comp.rul_days < 30;
                          const healthPct = Math.max(0, Math.min(100, comp.current_health_pct));
                          const hasRange = comp.rul_days_low != null && comp.rul_days_high != null && comp.rul_days_high > comp.rul_days_low;

                          return (
                            <div key={i} className="space-y-1.5">
                              <div className="flex justify-between items-start text-[11px] gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="capitalize font-medium text-muted-foreground">{comp.component}</span>
                                  {comp.model_corroborated && (
                                    <span
                                      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200/60 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20"
                                      title="This component is among the AI model's top factors for this asset's maintenance prediction"
                                    >
                                      Model-confirmed
                                    </span>
                                  )}
                                  {comp.disagrees_with_model && (
                                    <span
                                      className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
                                      title={`This component's own trend looks fine, but the AI model predicts maintenance is needed sooner (~${comp.model_days_ceiling}d) for this asset overall — treat this component's estimate with caution`}
                                    >
                                      <AlertTriangle className="h-2.5 w-2.5" />
                                      Check model
                                    </span>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <span className={cn("font-bold tabular-nums block", isCritical ? "text-red-500" : "text-foreground")}>
                                    {comp.rul_days != null
                                      ? `${comp.rul_days}${comp.horizon_capped ? "+" : ""} days left`
                                      : comp.degradation_pct_per_day != null && comp.degradation_pct_per_day >= 0
                                      ? "Improving"
                                      : "—"}
                                  </span>
                                  {hasRange && (
                                    <span className="text-[9px] text-muted-foreground/50 font-mono">
                                      range {comp.rul_days_low}–{comp.rul_days_high}d
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="relative h-2 rounded-full bg-slate-200/60 dark:bg-white/8">
                                <div
                                  className={cn("absolute h-full rounded-full", isCritical ? "bg-red-500" : "bg-primary")}
                                  style={{ width: `${healthPct}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono">
                                <span>{healthPct.toFixed(0)}% health</span>
                                <span>
                                  {comp.confidence === "single_point"
                                    ? "Low confidence (1 reading)"
                                    : `Trend over ${comp.readings_used} readings`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ═══ Tickets ═══ */}
          <TabsContent value="tickets" className="mt-4 space-y-3">
            {tickets.length === 0 ? (
              <EmptyState message="No tickets raised for this asset." icon={Ticket} />
            ) : (
              tickets.map((t) => {
                const s = (t.status || "").toLowerCase();
                const statusBorder =
                  s === "open"
                    ? "border-rose-500/30 dark:border-rose-500/25 hover:border-rose-500 dark:hover:border-rose-500/60"
                    : s === "in-progress" || s === "in_progress"
                    ? "border-amber-500/30 dark:border-amber-500/25 hover:border-amber-500 dark:hover:border-amber-500/60"
                    : s === "resolved"
                    ? "border-emerald-500/30 dark:border-emerald-500/25 hover:border-emerald-500 dark:hover:border-emerald-500/60"
                    : "border-slate-500/30 dark:border-slate-500/25 hover:border-slate-500 dark:hover:border-slate-500/60";
                return (
                  <button
                    key={t.id}
                    onClick={() => goToTicket(t.id)}
                    className={cn("w-full text-left ticket-dynamic rounded-xl border p-4 transition-all group", statusBorder)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground/60">{t.ticket_number}</span>
                          <TicketStatusPill status={t.status} />
                          <PriorityPill priority={t.final_priority ?? t.predicted_priority ?? t.priority} />
                          {t.final_category && (
                            <span className="text-[10px] text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded-full">
                              {t.final_category}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 text-sm font-semibold truncate">{t.title}</div>
                        <div className="text-[12px] text-muted-foreground/70 mt-0.5 line-clamp-1">{t.description}</div>
                        <div className="text-[11px] text-muted-foreground/50 mt-1">
                          Opened {fmt(t.opened_at)}
                          {t.resolved_at && ` · Resolved ${fmt(t.resolved_at)}`}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors shrink-0 mt-1" />
                    </div>
                  </button>
                );
              })
            )}
          </TabsContent>

          {/* ═══ Maintenance Logs ═══ */}
          <TabsContent value="maintenance" className="mt-4 space-y-3">
            {maintenanceEvents.length === 0 ? (
              <EmptyState message="No maintenance events recorded for this asset." icon={ClipboardList} />
            ) : (
              maintenanceEvents.map((e) => (
                <div key={e.id} className="ticket-dynamic rounded-xl border border-slate-200/80 dark:border-white/6 p-4 space-y-2 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                        {e.event_type}
                      </span>
                      <div className="text-sm font-semibold">{e.title}</div>
                      <div className="text-[11px] text-muted-foreground/70">
                        {e.performed_at ? fmt(e.performed_at) : fmt(e.scheduled_date)}
                        {e.vendor_name && ` · ${e.vendor_name}`}
                      </div>
                    </div>
                    <div className="text-sm font-bold shrink-0 tabular-nums">
                      {e.cost_amount != null ? fmtCost(e.cost_amount, e.currency) : "—"}
                    </div>
                  </div>
                  {e.notes && <p className="text-sm text-muted-foreground/80 leading-relaxed">{e.notes}</p>}
                  {e.odometer_reading != null && (
                    <div className="text-[11px] text-muted-foreground/50">
                      Odometer: {Number(e.odometer_reading).toLocaleString()} km
                      {e.downtime_hours != null && ` · Downtime: ${e.downtime_hours}h`}
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* ═══ Assignments ═══ */}
          <TabsContent value="assignments" className="mt-4 space-y-3">
            {assignments.length === 0 ? (
              <EmptyState message="No assignment history for this asset." icon={Users} />
            ) : (
              assignments.map((a) => (
                <div key={a.id} className="ticket-dynamic rounded-xl border border-slate-200/80 dark:border-white/6 p-4 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                        a.is_active
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
                          : "bg-slate-100 text-slate-500 ring-slate-200/60 dark:bg-white/6 dark:text-slate-400",
                      )}>
                        {a.is_active ? "Active" : "Past"}
                      </span>
                      <div className="mt-1 text-xs font-mono text-muted-foreground/70">User: {a.user_id}</div>
                      <div className="text-[11px] text-muted-foreground/50 mt-0.5">
                        Assigned {fmt(a.assigned_at)}
                        {a.unassigned_at && ` · Removed ${fmt(a.unassigned_at)}`}
                      </div>
                    </div>
                  </div>
                  {a.notes && <p className="mt-2 text-sm text-muted-foreground/70">{a.notes}</p>}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <LogMaintenanceDialog
        open={showLogMaintenance}
        onOpenChange={setShowLogMaintenance}
        asset={asset}
        onSaved={onRefresh}
      />
    </div>
  );
}
