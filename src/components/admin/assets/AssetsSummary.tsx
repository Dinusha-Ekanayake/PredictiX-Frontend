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
import type { AssetStats } from "./types";

/** One KPI tile: a label, a big value, and an optional caption. */
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
        <div className={`shrink-0 rounded-xl p-2.5 ${accentClass} dark:bg-white/6`}>
          <div className={iconClass}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Row of KPI tiles above the assets list.
 *
 * Shows skeletons on the first load, then the counts for the current warehouse.
 */
export default function AssetsSummary({
  stats,
  loading,
}: {
  stats: AssetStats | null;
  loading?: boolean;
}) {
  const total = stats?.total ?? 0;
  const operational = stats?.operational ?? 0;
  const maintenance = stats?.maintenance ?? 0;
  const critical = stats?.critical ?? 0;
  const offline = stats?.offline ?? 0;
  // Null, not 0, when nothing has been scored yet. Shown as "No data" below.
  const avgHealth = stats?.avgHealth ?? null;
  const scoredCount = stats?.avgHealthScoredCount ?? 0;

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card-dynamic rounded-2xl border border-slate-200 dark:border-slate-700 bg-card p-4 h-[92px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <SummaryCard
        label="Total Assets"
        value={total}
        sub="This warehouse"
        icon={<Boxes className="h-4 w-4" />}
        accentClass="bg-slate-100"
        iconClass="text-slate-600 dark:text-slate-300"
      />
      <SummaryCard
        label="Avg. Health"
        value={avgHealth != null ? `${avgHealth}%` : "No data"}
        sub={avgHealth != null ? `AI-predicted · ${scoredCount} of ${total} assets` : "No predictions yet"}
        icon={<Activity className="h-4 w-4" />}
        accentClass="bg-blue-50"
        iconClass="text-blue-600 dark:text-blue-400"
      />
      {/* Operational, Maintenance and Offline count asset status. Critical Band
          counts health instead. An asset can be active and in the critical band
          at once, so these tiles do not add up to Total Assets. The captions on
          each tile say which of the two it is reading. */}
      <SummaryCard
        label="Operational"
        value={operational}
        sub={`Status: active (${total ? Math.round((operational / total) * 100) : 0}%)`}
        icon={<CheckCircle2 className="h-4 w-4" />}
        accentClass="bg-emerald-50"
        iconClass="text-emerald-600 dark:text-emerald-400"
      />
      <SummaryCard
        label="Maintenance"
        value={maintenance}
        sub="Status: under maintenance"
        icon={<Wrench className="h-4 w-4" />}
        accentClass="bg-amber-50"
        iconClass="text-amber-600 dark:text-amber-400"
      />
      <SummaryCard
        label="Critical Band"
        value={critical}
        sub="Health band (independent of status)"
        icon={<AlertTriangle className="h-4 w-4" />}
        accentClass="bg-red-50"
        iconClass="text-red-600 dark:text-red-400"
      />
      <SummaryCard
        label="Offline"
        value={offline}
        sub="Status: inactive / decommissioned"
        icon={<WifiOff className="h-4 w-4" />}
        accentClass="bg-slate-100"
        iconClass="text-slate-500 dark:text-slate-400"
      />
    </div>
  );
}
