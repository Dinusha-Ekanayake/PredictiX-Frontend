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

export function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200/20 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-2 font-semibold text-slate-900 dark:text-white">{label}</p>}
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color || p.payload?.fill || "#cbd5e1" }} />
          <span className="flex-1 font-medium capitalize">{p.name.replace(/_/g, ' ')}</span>
          <span className="font-bold text-slate-900 dark:text-white tabular-nums">{p.value}</span>
        </div>
      ))}
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
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0) || 1;
  const statusData = data.map(d => ({
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
                <Tooltip content={<CustomTooltip />} />
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
  const { axisColor, gridColor } = useChartStyles();
  const COLORS = ['#22d3ee', '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444', '#f59e0b', '#10b981'];

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Health Score Distribution
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[260px] w-full mt-2">
          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap={16}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="bucket" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.2 }} />
              <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} iconType="circle" />
              <Bar dataKey="count" name="Number of Assets" radius={[6, 6, 0, 0]}>
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
