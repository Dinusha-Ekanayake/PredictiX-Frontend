"use client";

import * as React from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { ShieldAlert, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssetAnalytics } from "./types";

const STATUS_COLOR: Record<string, string> = {
  active: "#10b981",
  critical: "#ef4444",
  under_maintenance: "#f59e0b",
  inactive: "#6b7280",
  decommissioned: "#94a3b8",
};

const HEALTH_COLOR: Record<string, string> = {
  excellent: "#10b981",
  good: "#6366f1",
  moderate: "#f59e0b",
  poor: "#f97316",
  critical: "#ef4444",
};

const HEALTH_ORDER = ["excellent", "good", "moderate", "poor", "critical"];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-semibold text-foreground">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="flex-1">{p.name}</span>
          <span className="font-semibold text-foreground tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function PieLegendItem({ color, label, count, pct }: {
  color: string; label: string; count: number; pct: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="text-[11px] text-muted-foreground flex-1 capitalize">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="text-[11px] font-semibold tabular-nums w-5 text-right">{count}</span>
      </div>
    </div>
  );
}

/** Charts summarising status, health and vehicle type across the fleet. */
export default function AssetsAnalytics({
  analytics,
  loading,
}: {
  analytics: AssetAnalytics | null;
  loading?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  if (loading && !analytics) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Descriptive Analytics
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[220px] rounded-2xl border border-border/50 bg-card animate-pulse" />
          <div className="h-[220px] rounded-2xl border border-border/50 bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const total =
    analytics.statusDistribution.reduce((s, d) => s + d.value, 0) || 1;

  // ── Status distribution (fleet-wide, from the backend) ────────────────
  const statusData = analytics.statusDistribution
    .map((d) => ({ ...d, color: STATUS_COLOR[d.name] ?? "#6b7280" }))
    .sort((a, b) => b.value - a.value);

  // ── Health band distribution (fleet-wide, from the backend) ───────────
  const healthByName = Object.fromEntries(analytics.healthDistribution.map((d) => [d.name, d.value]));
  const healthData = HEALTH_ORDER
    .filter((k) => healthByName[k] !== undefined)
    .map((k) => ({ name: k, value: healthByName[k], color: HEALTH_COLOR[k] ?? "#6b7280" }));

  // ── Vehicle type breakdown (fleet-wide, from the backend) ──────────────
  const typeData = analytics.vehicleTypeDistribution.map((d) => ({
    name: d.name.replace(/_/g, " ").replace(/(\d+T$)/, " $1").trim(),
    value: d.value,
  }));

  // ── Top at-risk assets (fleet-wide, from the backend) ──────────────────
  const atRisk = analytics.topAtRisk;

  const bandBadge: Record<string, string> = {
    critical: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    poor: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  };

  if (total === 1 && analytics.statusDistribution.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
        Descriptive Analytics
      </h2>

      {/* ── Row 1: Status + Health donuts ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status distribution */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div style={{ height: 140, width: 140, flexShrink: 0 }}>
                <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" innerRadius={38} outerRadius={58}
                      paddingAngle={2} startAngle={90} endAngle={-270}>
                      {statusData.map((d, i) => <Cell key={i} fill={d.color} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {statusData.map((d) => (
                  <PieLegendItem key={d.name} color={d.color} label={d.name.replace("_", " ")}
                    count={d.value} pct={Math.round((d.value / total) * 100)} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health band distribution */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold">Health Band Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div style={{ height: 140, width: 140, flexShrink: 0 }}>
                <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                  <PieChart>
                    <Pie data={healthData} dataKey="value" innerRadius={38} outerRadius={58}
                      paddingAngle={2} startAngle={90} endAngle={-270}>
                      {healthData.map((d, i) => <Cell key={i} fill={d.color} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {healthData.map((d) => (
                  <PieLegendItem key={d.name} color={d.color} label={d.name}
                    count={d.value} pct={Math.round((d.value / total) * 100)} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Vehicle type bar + At-risk table ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Vehicle type bar chart */}
        <Card className="rounded-2xl lg:col-span-3">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold">Assets by Vehicle Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 200 }}>
              <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                <BarChart data={typeData} margin={{ top: 4, right: 8, left: -20, bottom: 30 }}
                  barCategoryGap={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: axisColor }}
                    axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Assets" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top at-risk assets */}
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Top At-Risk Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {atRisk.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <ShieldAlert className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs text-muted-foreground">No critical or poor assets</p>
              </div>
            ) : (
              atRisk.map((a) => (
                <div key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-border/50 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold">
                      {a.asset_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">{a.asset_code}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${bandBadge[a.health_band ?? ""] ?? ""}`}>
                    {a.health_band}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
