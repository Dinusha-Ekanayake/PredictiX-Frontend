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

const healthMaintenanceTrends = [
  { month: "Jul", avgHealth: 86, maintenance: 1 },
  { month: "Aug", avgHealth: 82, maintenance: 1 },
  { month: "Sep", avgHealth: 80, maintenance: 1 },
  { month: "Oct", avgHealth: 78, maintenance: 2 },
  { month: "Nov", avgHealth: 77, maintenance: 2 },
  { month: "Dec", avgHealth: 76, maintenance: 1 },
];

const assetStatus = [
  { name: "Operational", value: 67 },
  { name: "Maintenance", value: 17 },
  { name: "Critical", value: 17 },
  { name: "Offline", value: 0 },
];

const STATUS_COLORS = {
  Active: "#10b981",
  Critical: "#ef4444",
  Under_Maintenance: "#f59e0b",
} as const;

const healthScoreDist = [
  { bucket: "90–100%", count: 2 },
  { bucket: "80–89%", count: 1 },
  { bucket: "70–79%", count: 1 },
  { bucket: "60–69%", count: 1 },
  { bucket: "< 60%", count: 1 },
];

const assetsByType = [
  { type: "Material Handling", count: 2 },
  { type: "Automation", count: 2 },
  { type: "Heavy Equipment", count: 1 },
  { type: "Climate Control", count: 1 },
];

// Reusable hook-based styles
function useChartStyles() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return {
    axisColor: isDark ? "#cbd5e1" : "#475569",
    gridColor: isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(148, 163, 184, 0.3)",
    tooltipStyle: {
      backgroundColor: isDark ? "#0f172a" : "#ffffff",
      border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
      color: isDark ? "#f8fafc" : "#0f172a",
    },
  };
}

export function HealthMaintenanceTrendsCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || healthMaintenanceTrends;
  const { axisColor, gridColor, tooltipStyle } = useChartStyles();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Health &amp; Maintenance Trends
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Avg health score and maintenance count (sample).
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: axisColor }} />
              <YAxis yAxisId="left" tick={{ fill: axisColor }} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" hide tick={{ fill: axisColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="avgHealth"
                name="Avg Health Score"
                stroke="#22d3ee"
                fill="#22d3ee"
                fillOpacity={0.35}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="maintenance"
                name="Assets in Maintenance"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.25}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function AssetStatusDistributionCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || assetStatus;
  const { axisColor, tooltipStyle } = useChartStyles();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-muted-foreground" />
          Asset Status Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Operational vs maintenance vs critical (sample).
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
              >
                {data.map((d) => (
                  <Cell
                    key={d.name}
                    fill={
                      STATUS_COLORS[d.name as keyof typeof STATUS_COLORS] ??
                      "hsl(var(--muted-foreground))"
                    }
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: axisColor }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function HealthScoreDistributionCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || healthScoreDist;
  const { axisColor, gridColor, tooltipStyle } = useChartStyles();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Health Score Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Number of assets by health bucket (sample).
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="bucket" tick={{ fill: axisColor }} />
              <YAxis tick={{ fill: axisColor }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Bar dataKey="count" name="Number of Assets" fill="#22d3ee" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function AssetsByTypeCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || assetsByType;
  const { axisColor, gridColor, tooltipStyle } = useChartStyles();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Assets by Type
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Asset counts by category (sample).
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" tick={{ fill: axisColor }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="type"
                tick={{ fill: axisColor }}
                width={120}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Bar dataKey="count" name="Number of Assets" fill="#14b8a6" radius={[8, 8, 8, 8]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}