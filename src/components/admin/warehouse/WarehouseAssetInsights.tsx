"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { useTheme } from "next-themes";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, PieChart as PieIcon, BarChart3 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981",
  critical: "#ef4444",
  under_maintenance: "#f59e0b",
  inactive: "#6b7280",
  decommissioned: "#94a3b8",
};

export function CustomTooltip({ active, payload, label, total }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-2 font-semibold text-foreground">{label}</p>}
      {payload.map((p: any) => {
        const pct = total ? Math.round((p.value / total) * 100) : 0;
        return (
          <div key={p.name} className="flex items-center gap-3 text-muted-foreground">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color || p.payload?.fill || "#cbd5e1" }} />
            <span className="flex-1 font-medium capitalize">{p.name.replace(/_/g, ' ')}</span>
            <span className="font-bold text-foreground tabular-nums">{p.value}</span>
            {total ? <span className="font-semibold text-muted-foreground opacity-80 tabular-nums ml-1">({pct}%)</span> : null}
          </div>
        );
      })}
    </div>
  );
}

export function PieLegendItem({ color, label, count, pct }: { color: string; label: string; count: number; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm" style={{ background: color }} />
      <span className="text-xs text-muted-foreground flex-1 capitalize font-medium">{label.replace(/_/g, ' ')}</span>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="text-xs font-bold tabular-nums w-6 text-right text-foreground">{count}</span>
      </div>
    </div>
  );
}

// Reusable hook-based styles
function useChartStyles() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return {
    axisColor: isDark ? "#cbd5e1" : "#475569",
    gridColor: isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(148, 163, 184, 0.3)",
  };
}

export function HealthMaintenanceTrendsCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const { axisColor, gridColor } = useChartStyles();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Health &amp; Maintenance Trends
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: axisColor, fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" hide />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor, strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} iconType="circle" />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="avgHealth"
                name="Avg Health Score"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#colorHealth)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="maintenance"
                name="Assets in Maintenance"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#colorMaint)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function AssetStatusDistributionCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const ALL_STATUSES = ["active", "critical", "under_maintenance", "inactive", "decommissioned"];
  
  // Merge to ensure all categories show up, even if 0
  const mergedData = ALL_STATUSES.map(name => {
    const existing = data.find(d => d.name.toLowerCase() === name);
    return existing || { name, value: 0 };
  });

  const total = mergedData.reduce((sum, item) => sum + (item.value || 0), 0) || 1;
  const statusData = mergedData.map(d => ({
    ...d,
    color: STATUS_COLORS[d.name.toLowerCase()] || STATUS_COLORS[d.name] || "#64748b"
  })).sort((a, b) => b.value - a.value);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <PieIcon className="h-4 w-4 text-muted-foreground" />
          Asset Status Distribution
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-6 mt-2 h-[260px]">
          <div style={{ height: 180, width: 180, flexShrink: 0 }}>
            <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="none"
                >
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-4">
            {statusData.map(d => (
              <PieLegendItem
                key={d.name}
                color={d.color}
                label={d.name}
                count={d.value}
                pct={Math.round((d.value / total) * 100)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HealthScoreDistributionCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const total = data.reduce((s, d) => s + d.count, 0) || 1;

  const HEALTH_COLOR: Record<string, string> = {
    "90–100%": "#10b981",
    "80–89%": "#6366f1",
    "70–79%": "#f59e0b",
    "60–69%": "#f97316",
    "< 60%": "#ef4444",
  };

  const BAND_LABEL: Record<string, string> = {
    "90–100%": "Excellent",
    "80–89%": "Good",
    "70–79%": "Moderate",
    "60–69%": "Poor",
    "< 60%": "Critical",
  };

  const pieData = data.map((d) => ({
    name: BAND_LABEL[d.bucket] || d.bucket,
    value: d.count,
    color: HEALTH_COLOR[d.bucket] ?? "#6b7280"
  }));

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">Health Band Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mt-2 h-[260px]">
          <div style={{ height: 180, width: 180, flexShrink: 0 }}>
            <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={85}
                  paddingAngle={3} startAngle={90} endAngle={-270} stroke="none">
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
                        {payload.map((p: any) => (
                          <div key={p.name} className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.payload.color }} />
                            <span className="flex-1">{p.name}</span>
                            <span className="font-semibold text-foreground tabular-nums">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {pieData.map((d) => {
              const pct = Math.round((d.value / total) * 100);
              return (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                  <span className="text-[11px] text-muted-foreground flex-1 capitalize">{d.name}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                    </div>
                    <span className="text-[11px] font-semibold tabular-nums w-5 text-right">{d.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AssetsByTypeCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const { axisColor, gridColor } = useChartStyles();
  const COLORS = ['#818cf8', '#c084fc', '#f472b6', '#fb7185', '#facc15', '#a3e635', '#4ade80', '#2dd4bf', '#38bdf8', '#60a5fa'];

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Assets by Type
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full mt-2">
          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              barCategoryGap={12}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
              <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="type"
                tick={{ fill: axisColor, fontSize: 11 }}
                width={100}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.2 }} />
              <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} iconType="circle" />
              <Bar dataKey="count" name="Assets" radius={[0, 6, 6, 0]} barSize={16}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
