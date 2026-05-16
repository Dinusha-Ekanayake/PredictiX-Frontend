"use client";

import * as React from "react";
import {
  Boxes,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  WifiOff,
  Activity,
} from "lucide-react";
import type { Asset } from "./types";
import { deriveHealthScore } from "./assetService";

function SummaryCard({
  label,
  value,
  sub,
  icon,
  accentClass,
  iconClass,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accentClass: string;
  iconClass: string;
}) {
  return (
    <div className="card-dynamic rounded-2xl border border-slate-200 dark:border-slate-700 bg-card p-4 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
          {sub && (
            <div className="mt-1 text-[11px] text-muted-foreground/70">{sub}</div>
          )}
        </div>
        <div className={`shrink-0 rounded-xl p-2.5 ${accentClass} dark:bg-white/[0.06]`}>
          <div className={iconClass}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

export default function AssetsSummary({
  assets,
}: {
  assets: Asset[];
}) {
  const total = assets.length;

  // Status counts — backend uses lowercase strings
  const operational = assets.filter(
    (a) => a.status === "active" || a.status === "operational",
  ).length;
  const maintenance = assets.filter(
    (a) => a.status === "maintenance" || a.status === "in_maintenance",
  ).length;
  const critical = assets.filter((a) => a.health_band === "critical").length;
  const offline = assets.filter(
    (a) => a.status === "inactive" || a.status === "retired" || a.status === "offline",
  ).length;

  // Average health from health_band mapping (no prediction data here to keep summary fast)
  const bandScore: Record<string, number> = {
    excellent: 90, good: 72, moderate: 52, poor: 30, critical: 12,
  };
  const avgHealth =
    total > 0
      ? Math.round(
          assets.reduce((s, a) => {
            const hs =
              a.health_band ? (bandScore[a.health_band.toLowerCase()] ?? 50) : 50;
            return s + hs;
          }, 0) / total,
        )
      : 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <SummaryCard
        label="Total Assets"
        value={total}
        sub="All warehouses"
        icon={<Boxes className="h-4 w-4" />}
        accentClass="bg-slate-100"
        iconClass="text-slate-600 dark:text-slate-300"
      />
      <SummaryCard
        label="Avg. Health"
        value={`${avgHealth}%`}
        sub="Fleet average"
        icon={<Activity className="h-4 w-4" />}
        accentClass="bg-blue-50"
        iconClass="text-blue-600 dark:text-blue-400"
      />
      <SummaryCard
        label="Operational"
        value={operational}
        sub={`${total ? Math.round((operational / total) * 100) : 0}% of fleet`}
        icon={<CheckCircle2 className="h-4 w-4" />}
        accentClass="bg-emerald-50"
        iconClass="text-emerald-600 dark:text-emerald-400"
      />
      <SummaryCard
        label="Maintenance"
        value={maintenance}
        sub="In progress"
        icon={<Wrench className="h-4 w-4" />}
        accentClass="bg-amber-50"
        iconClass="text-amber-600 dark:text-amber-400"
      />
      <SummaryCard
        label="Critical Band"
        value={critical}
        sub="Health critical"
        icon={<AlertTriangle className="h-4 w-4" />}
        accentClass="bg-red-50"
        iconClass="text-red-600 dark:text-red-400"
      />
      <SummaryCard
        label="Offline"
        value={offline}
        sub="Inactive / retired"
        icon={<WifiOff className="h-4 w-4" />}
        accentClass="bg-slate-100"
        iconClass="text-slate-500 dark:text-slate-400"
      />
    </div>
  );
}